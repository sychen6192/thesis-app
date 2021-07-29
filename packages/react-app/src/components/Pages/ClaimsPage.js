import React, { useState, useEffect } from "react";
import Jumbotron from '../Jumbotron';
import styled from 'styled-components';
import { ethers } from "ethers";
import { Contract } from "@ethersproject/contracts";
import { RINKEBY_ID, addresses, abis } from "@uniswap-v2-app/contracts";
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import CircularProgressWithLabel from '@material-ui/core/CircularProgress';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import { green } from '@material-ui/core/colors';
import Avatar from '@material-ui/core/Avatar';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import { StepContent } from "@material-ui/core";
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Backdrop from '@material-ui/core/Backdrop';


const useStyles = makeStyles((theme) => ({
    table: {
        minWidth: 650,
    },
    approve: {
        margin: theme.spacing(3, 0, 2),
    },
    wrapper: {
        margin: theme.spacing(1),
        position: 'relative',
    },
    buttonProgress: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
      },
}));

export default function ClaimsPage(props) {
    const classes = useStyles();
    const [policyAddress, setPolicyAddress] = useState(0);
    const [requests, setRequests] = useState([]);
    const [stakeHoldersCount, setStakeHoldersCount] = useState(0);
    const [delegatorCount, setDelegatorCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [requestCount, setRequestCount] = useState(0);
    const [isDelegator, setIsDelegator] = useState(false);
    const [content, setContent] = useState('');
    const [multiple, setMultiple] = useState('');

    useEffect(() => {
        const getPolicies = async () => {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner()
            const account = await signer.getAddress()

            const policyFactoryContract = new Contract(addresses[RINKEBY_ID].policyFactory, abis.policyFactory, provider)
            const policiesAddress = await policyFactoryContract.deployedPolicies(props.match.params.id)
            const policy = new Contract(policiesAddress, abis.policy, provider)
            const policyStakeHolders = await policy.getPolicyStakeholders();
            const requestCount = await policy.getRequestsCount();
            const registryContract = new Contract(addresses[RINKEBY_ID].registry, abis.registry, provider)
            const delegatorCount = await registryContract.getDelegatorCount()
            const isDelegator = await registryContract.validDelegators(account)

            setIsDelegator(isDelegator)
            setRequestCount(requestCount);
            setStakeHoldersCount(policyStakeHolders.length)
            setDelegatorCount(parseInt(delegatorCount.toString()));
            setPolicyAddress(policiesAddress)

            const requests = await Promise.all(
                Array(parseInt(requestCount))
                    .fill()
                    .map((element, index) => {
                        return policy.requests(index);
                    }).reverse()
            );
            setRequests(requests)
        }


        getPolicies();
    }, []);


    function refreshPage() {
        window.location.reload(false);
      }

    async function delApprove(idx) {
        try {
            let tx;
            setLoading(true);
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner()
            const policyContract = new Contract(policyAddress, abis.policy, signer);
            tx = await policyContract.delApproveRequest(
                idx
            );
            // until transactionHash is mined.
            await provider.waitForTransaction(tx.hash);
            setLoading(false);
            console.log(tx);
            refreshPage();
        } catch (err) {
            console.log(err)
        }
        setLoading(false);
    }

    async function Approve(idx) {
        try {
            let tx;
            setLoading(true);
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner()
            const policyContract = new Contract(policyAddress, abis.policy, signer);
            tx = await policyContract.approveRequest(
                idx
            );
            // until transactionHash is mined.
            await provider.waitForTransaction(tx.hash);
            setLoading(false);
            console.log(tx);
            refreshPage();
        } catch (err) {
            console.log(err)
        }
        setLoading(false);
    }

    async function Request() {
        try {
            let tx;
            setLoading(true);
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner()
            const policyContract = new Contract(policyAddress, abis.policy, signer);
            tx = await policyContract.createRequest(
                content, multiple
            );
            // until transactionHash is mined.
            await provider.waitForTransaction(tx.hash);
            setLoading(false);
            console.log(tx);
            refreshPage();
        } catch (err) {
            console.log(err)
        }
        setLoading(false);
    }

    async function approveToken() {
        try {
            let tx;
            setLoading(true);
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner()
            const erc721Contract = new Contract(addresses[RINKEBY_ID].tokens.ATP, abis.erc721, signer);
            tx = await erc721Contract.setApprovalForAll(
                policyAddress,
                true
            );
            // until transactionHash is mined.
            await provider.waitForTransaction(tx.hash);
            setLoading(false);
            console.log(tx);
            refreshPage();
        } catch (err) {
            console.log(err)
        }
        setLoading(false);
    }


    async function Claim(idx) {
        try {
            let tx;
            setLoading(true);
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner()
            const policyContract = new Contract(policyAddress, abis.policy, signer);
            tx = await policyContract.claimRequest(
                idx
            );
            // until transactionHash is mined.
            await provider.waitForTransaction(tx.hash);
            setLoading(false);
            console.log(tx);
            refreshPage();
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
            <Jumbotron
                title="Claims"
                description="Earn rewards by approving claims." />
            <Container className={classes.container} maxWidth='xs' component={Paper} style={{ padding: '0px 30px 30px 30px' }}>
                <CssBaseline />
                <div className={classes.paper}>
                    <form className={classes.form} noValidate>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            id="content"
                            label="IPFS Content"
                            name="content"
                            onChange={e => setContent(e.target.value)}
                        />
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            name="multiple"
                            label="Multiple"
                            id="multiple"
                            onChange={e => setMultiple(e.target.value)}
                        />
                        <ButtonGroup variant="contained" color="primary" aria-label="contained primary button group">

                            <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                disabled={loading}
                                onClick={e => approveToken()}
                            >
                                Approve tokens
                            </Button>

                            <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                disabled={loading}
                                onClick={e => Request()}
                            >
                                Request
                            </Button>
                        </ButtonGroup>
                    </form>
                </div>

            </Container>

            <Container className={classes.container} maxWidth='lg' style={{ marginTop: '30px' }}>

                <TableContainer component={Paper}>
                    <Table className={classes.table} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell align="right">IPFS Content</TableCell>
                                <TableCell align="right">Multiple</TableCell>
                                <TableCell align="right">Requester</TableCell>
                                <TableCell align="right">Approve Rate</TableCell>
                                <TableCell align="right">Dele. Approve Rate</TableCell>
                                <TableCell align="right">Action</TableCell>
                                <TableCell align="right">Delegator</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {requests.map((request, idx) => (
                                <TableRow key={idx} style={ request.complete ? {backgroundColor: '#E0E0E0'} : {}} >
                                    <TableCell component="th" scope="row">
                                        {requestCount - idx}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography color="textSecondary">
                                            <Link href={`https://ipfs.io/ipfs/${request.description_URI}/`} rel="noopener" target="_blank" style={{ textDecoration: 'none' }}>
                                                {request.description_URI}
                                            </Link>
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">{request.multiple.toString()}</TableCell>
                                    <TableCell align="right">{request.requester.slice(0, 6)}...{request.requester.slice(-4)}</TableCell>
                                    <TableCell align="right">
                                        <Box position="relative" display="inline-flex">
                                            <CircularProgressWithLabel
                                                variant="determinate"
                                                value={parseInt(request.approvalCount.toString()) / (stakeHoldersCount) * 100} />
                                            <Box
                                                top={0}
                                                left={0}
                                                bottom={0}
                                                right={0}
                                                position="absolute"
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="center"
                                            >
                                                <Typography variant="caption" component="div" color="textSecondary">{`${Math.round(
                                                    parseInt(request.approvalCount.toString()) / (stakeHoldersCount) * 100
                                                )}%`}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Box position="relative" display="inline-flex">
                                            <CircularProgressWithLabel
                                                variant="determinate"
                                                value={parseInt(request.delApprovalCount.toString()) / (delegatorCount) * 100} />
                                            <Box
                                                top={0}
                                                left={0}
                                                bottom={0}
                                                right={0}
                                                position="absolute"
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="center"
                                            >
                                                <Typography variant="caption" component="div" color="textSecondary">{`${Math.round(
                                                    parseInt(request.delApprovalCount.toString()) / (delegatorCount) * 100
                                                )}%`}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="right">
                                        <div className={classes.wrapper}>
                                            {parseInt(request.approvalCount.toString()) / (stakeHoldersCount) * 100 > 66 && parseInt(request.delApprovalCount.toString() / (delegatorCount)) * 100 > 66 ?
                                                <Button
                                                    size="small"
                                                    color="secondary"
                                                    disabled={loading}
                                                    className={classes.approve}
                                                    onClick={e => Claim(requestCount - idx - 1)}
                                                >
                                                    Claim
                                        </Button>
                                                : <Button
                                                    size="small"
                                                    color="primary"
                                                    disabled={loading}
                                                    className={classes.approve}
                                                    onClick={e => Approve(requestCount - idx - 1)}
                                                >
                                                    Approve
                                        </Button>}
                                        </div>
                                    </TableCell>
                                    <TableCell align="right">
                                        <div className={classes.wrapper}>
                                            <Button
                                                size="small"
                                                color="primary"
                                                disabled={loading || !isDelegator}
                                                className={classes.approve}
                                                onClick={e => delApprove(requestCount - idx - 1)}
                                            >
                                                Approve
                                        </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Container>

        </div>
    );
}