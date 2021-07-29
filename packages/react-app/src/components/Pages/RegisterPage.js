import React, { useState, useEffect } from 'react';
import { Contract } from "@ethersproject/contracts";
import { RINKEBY_ID, addresses, abis } from "@uniswap-v2-app/contracts";
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { ethers } from "ethers";
// import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props'
import FacebookLogin from 'react-facebook-login';



const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
  },
  image: {
    backgroundImage: 'url(https://source.unsplash.com/1600x900/?ethereum)',
    backgroundRepeat: 'no-repeat',
    backgroundColor:
      theme.palette.type === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  paper: {
    margin: theme.spacing(8, 4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function SignInSide() {
  const classes = useStyles();
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const [account, setAccount] = useState('Please connect to Metamask');
  const [login, setLogin] = useState(false);
  const [data, setData] = useState({id:'',name: ''});
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [refcode, setRefcode] = useState('');
  
  const responseFacebook = (response) => {
    setData(response);
    if (response.accessToken) {
      setLogin(true);
    } else {
      setLogin(false);
    }
  }
  
  useEffect(() => {
    async function getAccount() {
        const signer = provider.getSigner()
        const account = await signer.getAddress()
        const balance = await provider.getBalance(account)
        setAccount(account)
      }
      getAccount();
    }, [])
    

    async function Refcode() {
        let refcode;
        setLoading(true);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner()
        const registryContract = new Contract(addresses[RINKEBY_ID].registry, abis.registry, signer);
        refcode = await registryContract.getRefCode()
        setRefcode(refcode)
        setOpen(true)
        return refcode
    }

    async function Register() {
        try {
            let tx;
            setLoading(true);
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner()
            const registryContract = new Contract(addresses[RINKEBY_ID].registry, abis.registry, signer);
            tx = await registryContract.register(
                data.id,
                data.name
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

    const handleOpen = () => {
      setOpen(true);
    };
  
    const handleClose = () => {
      setOpen(false);
    };
      

  return (
    <Grid container component="main" className={classes.root}>
      
      <CssBaseline />
      <Grid item xs={false} sm={4} md={7} className={classes.image} />
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
      
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Register
          </Typography>
          <form className={classes.form} noValidate >
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="address"
              label="Ethereum Address"
              name="address"
              value={account}
              disabled
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="Facebook Id"
              label="Facebook Id"
              id="uid"
              value={data.id}
              disabled
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="Facebook Name"
              label="Facebook Name"
              id="name"
              value={data.name}
              disabled
            />
              <Grid container>
                <FacebookLogin
                appId="360104115420180"
                autoLoad={false}
                fields="name,email"
                scope="public_profile"
                callback={responseFacebook}
                cssClass="my-facebook-button-class"
                textButton="Connect to Facebook 🥺"
                size="small"
                />
                </Grid>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={Register}
            >
              Register
            </Button>
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              onClick={Refcode}
              style={{marginTop:'10px'}}
            >
              referral code
            </Button>
          </form>
          {refcode}
        </div>
      </Grid>
    </Grid>
  );
}