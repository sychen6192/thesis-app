import React, { useState, useEffect } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import StarIcon from '@material-ui/icons/StarBorder';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import ReactDOM from 'react-dom';
 

const useStyles = makeStyles((theme) => ({
    '@global': {
      ul: {
        margin: 0,
        padding: 0,
        listStyle: 'none',
      },
    },
    appBar: {
      borderBottom: `1px solid ${theme.palette.divider}`,
      background: '#393C42'
    },
    toolbar: {
      flexWrap: 'wrap',
    },
    toolbarTitle: {
      flexGrow: 1,
      color: '#ECEDED',
    },
    link: {
      margin: theme.spacing(1, 1.5),
      color: '#ECEDED',
    },
    walletButton: {
      color: '#24947A',
      borderColor: '#24947A',
      borderRadius: '50px'
    }
  }));



export default function Header({ provider, loadWeb3Modal, logoutOfWeb3Modal }) {
    const classes = useStyles();
    const [network, setNetwork] = useState('No network detected');
    const [account, setAccount] = useState('Connect Metamask');

    useEffect(() => {
        const getNetwork = async () => {
            if (provider) {
                const network = await provider.getNetwork().name
                const account = await provider.listAccounts()
                setNetwork(network)
                setAccount(account[0].slice(0, 6)+'...'+account[0].slice(-4))
            }
        }
        getNetwork();
    }, [provider])

    function WalletButton({ provider, loadWeb3Modal, logoutOfWeb3Modal }) {
        return (
            <Button variant="outlined" className={classes.walletButton}
                onClick={() => {
                    if (!provider) {
                        loadWeb3Modal();
                    } else {
                        logoutOfWeb3Modal();
                    }
                }}
            >
                {account}
            </Button>
        );
    }

    return (
        <AppBar position="static" color="default" elevation={0} className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <Typography variant="h6" color="inherit" noWrap className={classes.toolbarTitle} >
            Sycoin Mutual Insurance
          </Typography>
          <nav>
            <Link variant="button" href="/" className={classes.link}>
              SWAP
            </Link>
            <Link variant="button" href="/pool" className={classes.link}>
              Pool
            </Link>
            <Link variant="button" href="/staking" className={classes.link}>
              Project
            </Link>
            <Link variant="button" href="/policy/new" className={classes.link}>
              Propose
            </Link>
            <Link variant="button" href="/register" className={classes.link}>
              Register
            </Link>
          </nav>
            <WalletButton provider={provider} loadWeb3Modal={loadWeb3Modal} logoutOfWeb3Modal={logoutOfWeb3Modal} />
        </Toolbar>
      </AppBar>
    );
}
