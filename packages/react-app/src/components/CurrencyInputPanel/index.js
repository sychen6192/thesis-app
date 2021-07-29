import React, { useState, useEffect } from 'react';
import { RINKEBY_ID, addresses, abis } from "@uniswap-v2-app/contracts";
import { Contract } from "@ethersproject/contracts";
import { ethers } from "ethers";
import styled from 'styled-components';
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



// const projectId = "66fbccb2856b40b3a622d925568379e9";
// const projectSecret = "275ed56f36e440e0ab7cad94a3310aae";


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
    align: 'right',

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



export default function CurrencyInputPanel() {
  const classes = useStyles()

  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const [ETHAmount, setETHAmount] = useState('');
  const [SYCAmount, setSYCAmount] = useState('');
  const [SYCPrice, setSYCPrice] = useState(0);
  const [ETHPrice, setETHPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [totoken, setTotoken] = useState(true);
  const [approveAlready, setApproveAlready] = useState(false);
  const [networkId, setNetworkId] = useState(0);

  useEffect(() => {
      async function getNetworkId() {
          const provider = new ethers.providers.Web3Provider(window.ethereum)
          const networkId = await provider.getNetwork()
          setNetworkId(networkId.chainId) 
      }
      async function getApproveState() {
        const SycContract = new Contract(addresses[RINKEBY_ID].tokens.SYC, abis.erc20.abi, provider);
        const account = await provider.listAccounts()
        const approveState = await SycContract.allowance(account[0], addresses[RINKEBY_ID].implementation)

        approveState.gte('5742700000000000000000000') ? setApproveAlready(true):setApproveAlready(false)
      }
      getNetworkId();
      getApproveState();
  }, [])



  useEffect(() => {
    const fetchPrice = async () => {
      if (!isNaN(ETHAmount) && ETHAmount && totoken) {
        setSYCAmount(await getPairAmount())
      } else if (!isNaN(SYCAmount) && SYCAmount && !totoken) {
        setETHAmount(await getPairAmount())
      } else if (ETHAmount === '' || SYCAmount === '') {
        setSYCAmount('');
        setETHAmount('');
      }
    }
    fetchPrice();
  }, [ETHAmount, SYCAmount, totoken]);

  useEffect(() => {
    const getETHPrice = async () => {
      const priceInfo = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT')
      setETHPrice(priceInfo.data.price)
    }
    const getSYCPrice = async () => {
      const SycWethExchangeContract = new Contract(addresses[RINKEBY_ID].pairs["SYC-WETH"], abis.pair, provider);
      const reserves = await SycWethExchangeContract.getReserves();
      // reserves[0] is ETHER, reserves[1] is SYCoin
      const k = reserves[0].mul(reserves[1])
      if (totoken) {
        const y = ethers.utils.parseUnits('0.997', "ether").add(reserves[0])
        const x = ethers.utils.formatEther(reserves[1].sub(k.div(y)));
        setSYCPrice(x.toString())
      } else {
        const y = ethers.utils.parseUnits('0.997', "ether").add(reserves[1])
        const x = ethers.utils.formatEther(reserves[0].sub(k.div(y)));
        setSYCPrice(x.toString())
      }
    }
    getETHPrice();
    getSYCPrice();
  }, [totoken])


  async function getPairAmount() {
    try {

      const SycWethExchangeContract = new Contract(addresses[RINKEBY_ID].pairs["SYC-WETH"], abis.pair, provider);
      const reserves = await SycWethExchangeContract.getReserves();
      // reserves[0] is SYC, reserves[1] is ETHER
      const k = reserves[0].mul(reserves[1])
      let ETHAmountSubFee, SYCAmountSubFee, x, y;
      // fee to dev 0.3%
      if (totoken) {
        ETHAmountSubFee = (parseFloat(ETHAmount) * 0.997).toString();
        y = ethers.utils.parseUnits(ETHAmountSubFee, "ether").add(reserves[0])
        x = ethers.utils.formatEther(reserves[1].sub(k.div(y)));

      } else {
        SYCAmountSubFee = (parseFloat(SYCAmount) * 0.997).toString();
        y = ethers.utils.parseUnits(SYCAmountSubFee, "ether").add(reserves[1])
        x = ethers.utils.formatEther(reserves[0].sub(k.div(y)));

      }
      return x.toString();

    } catch (err) {
      console.log(err)
    }
  }

  function changeDirection() {
    setTotoken(!totoken);
    setSYCAmount('');
    setETHAmount('');
  }


  async function onSwap() {
    try {
      let tx;
      setLoading(true);
      const signer = provider.getSigner()
      const implemetationContract = new Contract(addresses[RINKEBY_ID].implementation, abis.implemetation, signer);
      if (totoken) {
        tx = await implemetationContract.swapETHToSyc({ value: ethers.utils.parseEther(ETHAmount) });
      } else {
        tx = await implemetationContract.swapSycForETH(ethers.utils.parseEther(SYCAmount));
      }
      // until transactionHash is mined.
      await provider.waitForTransaction(tx.hash);
      setLoading(false);
      console.log(tx);
    } catch (err) {
      console.log(err)
    }
    setLoading(false);
  }

  async function onApprove() {
    try {
      setLoading(true);
      const signer = provider.getSigner()
      const erc20Contract = new Contract(addresses[RINKEBY_ID].tokens.SYC, abis.erc20.abi, signer);
      let tx = await erc20Contract.approve(
        addresses[RINKEBY_ID].implementation,
        '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
      );
      await provider.waitForTransaction(tx.hash);
      setLoading(false);
      setApproveAlready(true);
    } catch (err) {
      console.log(err)
    }
    setLoading(false);
  }

  async function onMax() {
    const signer = provider.getSigner()
    const account = await signer.getAddress()
    const balance = await provider.getBalance(account)
    setETHAmount(ethers.utils.formatEther(balance.toString()))
  }


  if (totoken) {
    return (
      <div>
        <Container className={classes.container} maxWidth='lg'>
          <Card className={classes.root}>
            <CardContent className={classes.CardContent}>
              <Grid container className={classes.GridContainer} spacing={10}>
                <Grid item xs={12} sm={5}>
                  <Card className={classes.FormContent}>
                    <div style={{ display: "flex", justifyContent: 'space-between' }}>
                      <Typography className={classes.title} color="textPrimary">
                        Amount
                      </Typography>
                      <Button className={classes.max} onClick={e => {onMax()}}>
                        Max
                      </Button>
                    </div>
                    <div style={{ display: "flex" }}>
                    <input 
                    className={classes.currencyInput}
                    placeholder="0"
                    onChange={e => setETHAmount(e.target.value)}
                    value={ETHAmount}
                    />
                    <Button align='right' className={classes.symbol} display='inlign'>
                      ETH
                    </Button>
                    </div>
                    
                    <Typography className={classes.pos} color="textSecondary" align='right'>
                      ~${(ETHPrice * ETHAmount).toFixed(2)}
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
                    <i 
                    className="fas fa-exchange-alt fa-2x" 
                    onClick={e => changeDirection(false)}
                    style={{cursor: 'pointer'}} />
                  </div>
                </Grid>
                <Grid item xs={12} sm={5} style={{ cursor: 'not-allowed'}}>
                <Card className={classes.disabledFormContent}>
                    <div disabled style={{ display: "flex" }}>
                      <Typography className={classes.title} color="textPrimary">
                      Amount to be received (estimated)
                      </Typography>
                    </div>
                    <div style={{ display: "flex" }}>
                    <input 
                    className={classes.currencyInput}
                    disabled
                    style={{cursor: 'not-allowed', background: 'rgb(228, 232, 239)'}}
                    value={SYCAmount}
                    />
                    <Button align='right' className={classes.symbol} display='inlign'>
                      SYC
                    </Button>
                    </div>
                    <Typography className={classes.pos} color="textSecondary" align='right'>
                     {SYCAmount ? `${parseFloat(SYCAmount / ETHAmount).toFixed(3)} SYC per ETH`: '🤔 SYC per ETH'}
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
              <div style={{ 'marginRight': '0' }}>
                <Button 
                  variant="outlined" 
                  className={classes.swapButton}
                  onClick={e => onSwap()}
                  >
                  {loading && <CircularProgress size={14} />}
                  {!loading && 'SWAP'}   
                </Button>
              </div> 
            </CardContent>
          </Card>
        </Container>
        
      </div>
    );
  } else {
    return (
      <div>
      <Container className={classes.container} maxWidth='lg'>
        <Card className={classes.root}>
          <CardContent className={classes.CardContent}>
            <Grid container className={classes.GridContainer} spacing={10}>
              <Grid item xs={12} sm={5}>
                <Card className={classes.FormContent}>
                  <div style={{ display: "flex", justifyContent: 'space-between' }}>
                    <Typography className={classes.title} color="textPrimary">
                      Amount
                    </Typography>
                    <Button className={classes.max} onClick={e => {onMax()}}>
                      Max
                    </Button>
                  </div>
                  <div style={{ display: "flex" }}>
                  <input 
                  className={classes.currencyInput}
                  placeholder="0"
                  onChange={e => setSYCAmount(e.target.value)}
                  value={SYCAmount}
                  />
                  <Button align='right' className={classes.symbol} display='inlign'>
                    SYC
                  </Button>
                  </div>
                  
                  <Typography className={classes.pos} color="textSecondary" align='right'>
                    ~${ETHAmount ? `${(ETHAmount / SYCAmount * ETHPrice).toFixed(2)}`: '0.00'}
                  </Typography>
                </Card> 
              </Grid>
              <Grid item xs={12} sm={2}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
                  <i 
                  className="fas fa-exchange-alt fa-2x"
                  onClick={e => changeDirection(false)}
                  style={{cursor: 'pointer'}} />
                </div>
              </Grid>
              <Grid item xs={12} sm={5} style={{ cursor: 'not-allowed'}}>
              <Card className={classes.disabledFormContent}>
                  <div disabled style={{ display: "flex" }}>
                    <Typography className={classes.title} color="textPrimary">
                    Amount to be received (estimated)
                    </Typography>
                  </div>
                  <div style={{ display: "flex" }}>
                  <input 
                  className={classes.currencyInput}
                  disabled
                  style={{cursor: 'not-allowed', background: 'rgb(228, 232, 239)'}}
                  value={ETHAmount}
                  />
                  <Button align='right' className={classes.symbol} display='inlign'>
                    ETH
                  </Button>
                  </div>
                  <Typography className={classes.pos} color="textSecondary" align='right'>
                  {ETHAmount ? `${parseFloat(ETHAmount / SYCAmount).toFixed(6)} ETH per SYC`: '🤔 ETH per SYC'}
                  </Typography>
                </Card>
              </Grid>
            </Grid>
            <div style={{ marginRight: '0' }}>
            <Button 
              variant="outlined" 
              className={classes.swapButton}
              onClick={e => onSwap()}
              disabled={!approveAlready}
              >SWAP
            </Button>
            <Button style={{ marginRight: '10px' }}
              variant="outlined" 
              className={classes.swapButton}
              onClick={e => onApprove()}
              disabled={approveAlready}
              >Approve
            </Button> 
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>

    )
  }

}