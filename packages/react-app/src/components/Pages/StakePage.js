import React, { useState, useEffect } from "react";
import Jumbotron from '../Jumbotron';
import styled from 'styled-components';
import { ethers } from "ethers";
import { Contract } from "@ethersproject/contracts";
import { RINKEBY_ID, addresses, abis } from "@uniswap-v2-app/contracts";
import { Link as RouterLink } from 'react-router-dom';
import Link from "@material-ui/core/Link";
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';


export default function StakePage() {
    const [policies, setPolicies] = useState(0);

    useEffect(() => {
        const getPolicies = async () => {
            let policy, summary;
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const policyFactoryContract = new Contract(addresses[RINKEBY_ID].policyFactory, abis.policyFactory, provider);
            const policies = await policyFactoryContract.getDeloyedPolicies();
            console.log(policies)
            const allPolicies = await Promise.all(
                policies
                    .map((address, index) => {
                        policy = new Contract(address, abis.policy, provider);
                        return policy.getSummary();
                    }));

            setPolicies(allPolicies);
        }
        getPolicies();
    }, []);

    function renderList(policies) {
        if (policies == 0) {
            return <div>Loading...</div>
        }
        return Object.values(policies).map((element, idx) => {
            console.log(element)
            return (
                <Grid key={idx} item xs={4}>
                    <Card variant="outlined">
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                  </Typography>
                  <Typography variant="h5" component="h2">
                    {element[0]}
                  </Typography>
                  <Typography color="textSecondary">
                    <Link href={`https://ipfs.io/ipfs/${element[2]}`} rel="noopener" target="_blank" style={{ textDecoration: 'none' }}>
                        {element[2]}
                    </Link>
                  </Typography>
                  <Typography color="textSecondary">
                    Insurance base: <span style={{float: 'right'}}>{element[1].toString() / 10**18} Ether</span>
                  </Typography>
                  <Typography color="textSecondary">
                    Stacked: <span style={{float: 'right'}}>{element[3].toString() / 10**18} SYC</span>
                  </Typography>

                </CardContent>
                <CardActions>
                    <Button component={ RouterLink } to={`/staking/${idx}`} variant="contained" color="primary">
                        Stack
                    </Button>
                    <Button component={ RouterLink } to={`/claims/${idx}`} variant="contained" color="secondary">
                        Request
                    </Button>
                    <Button component={ RouterLink } to={`/stakeholders/${idx}`} variant="contained" color="secondary">
                        Stakeholders
                    </Button>
                </CardActions>
              </Card>
                </Grid>
            
            );
        })

    }


    return (
        <div>
            <Jumbotron
                title="Stake"
                description="Earn rewards by staking SYC on policies you want to engage." />
            <Container style={{ marginTop: "20px" }}>
                <Grid container style={{ marginTop: "20px" }} spacing={5}>
                    {renderList(policies)}
                </Grid>
            </Container>

        </div>
    );
}