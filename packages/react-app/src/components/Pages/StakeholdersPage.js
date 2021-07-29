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
    
}));

export default function StakeholdersPage(props) {
    const classes = useStyles();
    const [policyAddress, setPolicyAddress] = useState(0);
    const [requests, setRequests] = useState([]);
    const [stakeHolders, setStakeHolders] = useState([]);
    const [stakeHoldersAddress, setStakeHoldersAddress] = useState([]);
    const [delegatorCount, setDelegatorCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [requestCount, setRequestCount] = useState(0);
    const [isDelegator, setIsDelegator] = useState(false);
    const [endorsers, setEndorsers] = useState([]);

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

            setStakeHoldersAddress(policyStakeHolders)
            setIsDelegator(isDelegator)
            setRequestCount(requestCount);
            setDelegatorCount(parseInt(delegatorCount.toString()));
            setPolicyAddress(policiesAddress)
            const stakeholders = await Promise.all(
                policyStakeHolders.map((address, index) => {
                        return registryContract.mapInsurers(address)
                    })
            );
            const endorsers = await Promise.all(
                policyStakeHolders.map((endorser, index) => {
                        return policy.endorser(endorser)
                    })
            );
            setEndorsers(endorsers)
            setStakeHolders(stakeholders)
        }


        getPolicies();
    }, []);



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
        } catch (err) {
            console.log(err)
        }
        setLoading(false);
    }


    return (
        <div>
            <Jumbotron
                title="Stakeholders"
                description="Stakeholders List." />
            <Container className={classes.container} maxWidth='lg'>

                <TableContainer component={Paper}>
                    <Table className={classes.table} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell align="right">Address</TableCell>
                                <TableCell align="right">Name</TableCell>
                                <TableCell align="right">Endorser</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {stakeHolders.map((stakeHolder, idx) => (
                                <TableRow key={idx}>
                                    <TableCell component="th" scope="row">
                                        {idx+1}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography color="textSecondary">
                                            {stakeHoldersAddress[idx]}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography color="primary">
                                            {stakeHolder.userName}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography color="textSecondary">
                                            {endorsers[idx].slice(0, 6)+'...'+endorsers[idx].slice(-4)}
                                        </Typography>
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