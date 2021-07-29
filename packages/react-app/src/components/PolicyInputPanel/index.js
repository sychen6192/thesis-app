import React, { useState, useEffect } from 'react';
import { ethers } from "ethers";
import { Contract } from "@ethersproject/contracts";
import styled from 'styled-components';
import { RINKEBY_ID, addresses, abis } from "@uniswap-v2-app/contracts";
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';
import ipfs from '../../ipfs';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import FacebookLogin from 'react-facebook-login';
import PolicyIcon from '@material-ui/icons/Policy';
import CssBaseline from '@material-ui/core/CssBaseline';
import AccountCircle from '@material-ui/icons/AccountCircle';
import FacebookIcon from '@material-ui/icons/Facebook';
import InputAdornment from '@material-ui/core/InputAdornment';
import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from '@date-io/date-fns'; // choose your lib
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';


const useStyles = makeStyles((theme) => ({
    container: {
      marginTop: "20px",
      width: '800px',
      marginLeft: 'auto',
      marginRight: 'auto',
      backgroundColor: 'white',
      padding: '30px 30px 30px 30px',
      borderRadius: '10px'
    },
    avatar: {
      margin: theme.spacing(1),
      backgroundColor: theme.palette.secondary.main,
    },
    paper: {
      marginTop: theme.spacing(8),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    textField: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      width: 200,
    },
    form: {
      width: '100%', // Fix IE 11 issue.
      marginTop: theme.spacing(3),
    },
}));


export default function PolicyInputPanel() {
    const classes = useStyles()

    const [loading, setLoading] = useState(false);
    const [policyName, setPolicyName] = useState(0);
    const [policyType, setPolicyType] = useState(0);
    const [policyContent, setPolicyContent] = useState('');
    const [policyPremium, setPolicyPremium] = useState(0);
    const [policyStart, setPolicyStart] = useState(new Date());
    const [policyEnd, setPolicyEnd] = useState(new Date());
    const [policyDeadline, setPolicyDeadline] = useState(new Date());

    const [buffer, setBuffer] = useState('');
    const [contentHash, setContentHash] = useState('');
    const [login, setLogin] = useState(false);
    const [data, setData] = useState({});
  
    const responseFacebook = (response) => {
      console.log(response);
      setData(response);
      if (response.accessToken) {
        setLogin(true);
      } else {
        setLogin(false);
      }
    }


    function dateToUnix(value) {
        const date = new Date(value);
        return parseInt(date.getTime() / 10**3);
    }

    const captureFile = async event => {
      setLoading(true);
      console.log('capture file...');
      event.preventDefault();
      const file = event.target.files[0];
      const reader = new window.FileReader();
      reader.readAsArrayBuffer(file);
      reader.onloadend = () => {
        setBuffer(Buffer.from(reader.result));
      }
      // upload
      let data = buffer;
      console.log('Submit this: ', data);
      const postResponse = await ipfs.add(data);
      console.log("hash: ", postResponse['path']);
      setPolicyContent(postResponse['path']);
      setLoading(false);
    }


    async function createPolicy() {
        try {
          console.log(ethers.utils.parseEther(policyPremium))
          console.log(dateToUnix(policyStart), dateToUnix(policyEnd))
          console.log(dateToUnix(policyDeadline))
            let tx;
            setLoading(true);
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner()
            const policyFactoryContract = new Contract(addresses[RINKEBY_ID].policyFactory, abis.policyFactory, signer);
            console.log(policyFactoryContract)
            tx = await policyFactoryContract.createPolicy(
                policyName,
                policyType,
                ethers.utils.parseEther(policyPremium),
                dateToUnix(policyStart),
                dateToUnix(policyEnd),
                policyContent,
                dateToUnix(policyDeadline),
            );
          // until transactionHash is mined.
            await provider.waitForTransaction(tx.hash);
            setLoading(false);
            console.log(tx);
            } catch (err) {
            console.log(err)
            }
            setLoading(false);
        }
    return (
      <div>
        <Backdrop className={classes.backdrop} open={loading} >
                <CircularProgress color="inherit" />
      </Backdrop>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Container component="main" maxWidth="md">
        <CssBaseline />
        <div className={classes.paper}>
        <Grid container justify = "center">
      </Grid>
        <Grid container>
          <FacebookLogin
          appId="360104115420180"
          autoLoad={false}
          fields="name,email"
          scope="public_profile"
          size="small"
          callback={responseFacebook}
          icon="fa-facebook" />
        </Grid>
      <form className={classes.form} noValidate>
      <Grid container spacing={4}>
      <Grid item xs={12} sm={6}>
          <TextField
            required
            id="Proposer"
            label="Proposer"
            value={data.name}
            disabled
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircle />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="UserId"
            label="UserId"
            value={data.id}
            disabled
            fullWidth
            InputProps={{
              startAdornment: (
              <InputAdornment position="start">
                <FacebookIcon />
              </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="policyName"
            label="Title"
            onChange={e => setPolicyName(e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
        <TextField
          id="standard-select-type"
          required
          select
          label="Type"
          value={policyType}
          onChange={e => setPolicyType(e.target.value)}
          helperText="Please select your insurance type"
          fullWidth
        >
            <MenuItem value="Cyper Insurance">Cyper Insurance</MenuItem>
            <MenuItem value="Health Insurance">Health Insurance</MenuItem>
            <MenuItem value="Investment Insurance">Investment Insurance</MenuItem>
            <MenuItem value="Auto Insurance">Auto Insurance</MenuItem>
            <MenuItem value="Oracle BTC">Oracle BTC insurance</MenuItem>
            </TextField>
        </Grid>
        
        <Grid item xs={12} sm={6}>
        <DateTimePicker
            value={policyStart}
            disablePast
            onChange={e => setPolicyStart(e)}
            label="Start time"
            showTodayButton
            fullWidth
          />
        </Grid>

        <Grid item xs={12} sm={6}>
        <DateTimePicker
            value={policyEnd}
            disablePast
            onChange={e => setPolicyEnd(e)}
            label="End time"
            showTodayButton
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
        <DateTimePicker
            value={policyDeadline}
            disablePast
            onChange={e => setPolicyDeadline(e)}
            label="Deadline"
            showTodayButton
            fullWidth
          />
        </Grid>
        
        <Grid item xs={12} sm={9}>
          <TextField
            required
            id="policyContent"
            name="policyContent"
            label="Content Hash"
            value={policyContent}
            disabled
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={3}>
        <input
                type="file"
                accept=".pdf,.word,.jpg"
                className={classes.input}
                style={{ display: 'none', }}
                id="contained-button-file"
                multiple
                onChange={e => captureFile(e)}
              />
            <label htmlFor="contained-button-file">
            <Button variant="contained" component="span" className={classes.button} startIcon={<CloudUploadIcon />}>
              Upload Policy
            </Button>
            </label> 
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="Policypremium"
            name="Policypremium"
            label="Claim Base"
            onChange={e => setPolicyPremium(e.target.value)}
            fullWidth
          />
        </Grid>
        
        <Grid justify="flex-end" container>
          <Grid>
          <Button variant="contained" component="span" onClick={createPolicy} className={classes.button}>
              Create
          </Button>
          </Grid>
        </Grid>
      </Grid>
      </form>
    </div>
    
  </Container>
  </MuiPickersUtilsProvider>

  </div>
    )
}