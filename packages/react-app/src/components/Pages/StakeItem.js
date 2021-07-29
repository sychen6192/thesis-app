import React, { useState, useEffect } from "react";
import Jumbotron from '../Jumbotron';
import styled from 'styled-components';
import { ethers } from "ethers";
import { Contract } from "@ethersproject/contracts";
import { RINKEBY_ID, addresses, abis } from "@uniswap-v2-app/contracts";
import { Link } from 'react-router-dom';
import { ChainId, Token, WETH, Fetcher, Route } from '@uniswap/sdk'
import Container from '@material-ui/core/Container';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/Card';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Icon from '@material-ui/core/Icon';
import Typography from '@material-ui/core/Typography';
import CardActions from '@material-ui/core/CardActions';
import { Button, CircularProgress } from '@material-ui/core';
import axios from 'axios';
import StakeInputPanel from '../StakeInputPanel';


const useStyles = makeStyles((theme) => ({
    container: {
      marginTop: "20px",
    },
    root: {
    },
    CardContent: {
      backgroundColor: '#FFFFFF',
      paddingTop: '2rem',
      padding: '0px 2rem 2rem'
    },
    GridContainer: {
      padding: '0px 30px 30px 0px'
    },
    bullet: {
      display: 'inline-block',
      margin: '0 2px',
      transform: 'scale(0.8)',
    },
    title: {
      fontSize: 14,
      fontWeight: '600'
    },
    pos: {
      marginBottom: 12,
    },
    FormContent: {
      padding: '0.5rem 1rem',
      marginBottom: '1rem',
      borderRadius: '1rem',
      width: '100%',
      border: '1px solid rgb(228, 232, 239)',
      color: 'rgb(80, 80, 80)',
      boxShadow: 'rgb(0 0 0 / 4%) 0px 1px 6px inset',
    },
    disabledFormContent: {
      padding: '0.5rem 1rem',
      marginBottom: '1rem',
      borderRadius: '1rem',
      width: '100%',
      border: '1px solid rgb(228, 232, 239)',
      color: 'rgb(80, 80, 80)',
      boxShadow: 'rgb(0 0 0 / 4%) 0px 1px 6px inset',
      background: 'rgb(228, 232, 239)'
    },
    symbol: {
      fontSize: '1.5rem'
    },
    max: {
      display: 'inline',
      opacity: '1',
      lineHeight: '1rem',
      color: 'rgb(96, 211, 162)',
      cursor: 'pointer'
    },
    currencyInput: {
      padding: '1rem 1rem 1rem 0px',
      textAlign: 'right',
      border: 'none',
      fontSize: '1.5rem',
      fontWeight: '400',
      width: '100%',
      boxSizing: 'border-box',
      appearance: 'none',
      outline: 'none',
      "&:focus": {
        outline: 'none !important',
      }
    },
    swapButton: {
      color: '#24947A',
      borderColor: '#24947A',
      borderRadius: '50px',
      float: 'right',
      width: '100px',
      fontSize: '14px',
      loading: ''
    }
  }));
  

export default function StakeItem(props) {
    const classes = useStyles()
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const [policyAddress, setPolicyAddress] = useState('');
    const [minPremium, setminPremium] = useState(0);
    const [loading, setLoading] = useState(false);
    const [SYCPrice, setSYCPrice] = useState(0);
    const [ETHPrice, setETHPrice] = useState(0);

    useEffect(() => {
        const getETHPrice = async () => {
            const priceInfo = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT')
            setETHPrice(priceInfo.data.price)
        }
        const getSYCPrice = async () => {
          const SycWethExchangeContract = new Contract(addresses[RINKEBY_ID].pairs["SYC-WETH"], abis.pair, provider);
          const reserves = await SycWethExchangeContract.getReserves();
          // reserves[0] is SYC, reserves[1] is ETHER
          const k = reserves[0].mul(reserves[1])
          const y = ethers.utils.parseUnits('0.997', "ether").add(reserves[0])
          const x = ethers.utils.formatEther(reserves[1].sub(k.div(y)));
          setSYCPrice(x.toString())
        }
        getETHPrice();
        getSYCPrice();
      }, [])

    useEffect(() => {
        const getPolicies = async () => {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner()
            const account = await signer.getAddress()

            const policyFactoryContract = new Contract(addresses[RINKEBY_ID].policyFactory, abis.policyFactory, provider)
            const policiesAddress = await policyFactoryContract.deployedPolicies(props.match.params.id)
            const policy = new Contract(policiesAddress, abis.policy, provider)
            const policyInfo = await policy.getSummary()

            // bigNumber to String
            setPolicyAddress(policiesAddress)
            setminPremium(policyInfo[1].toString())

        }

        getPolicies();
    }, []);

    return (
        <div>
            <Jumbotron
                title="Deposit"
                description="Deposite ETH & SYC on your selected project." />
            <StakeInputPanel ether={minPremium} policyAddress={policyAddress}/>
      </div>
    );
}