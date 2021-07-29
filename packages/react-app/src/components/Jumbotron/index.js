import React from 'react';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

const useStyles = makeStyles((theme) => ({
    main: {
        marginBottom: theme.spacing(2),
        height: '8rem',
        padding: '1.5rem 2rem 2rem 2rem',
        boxShadow: 'rgba(200, 210, 225, 0.698) 4px 6px 23px 0px, rgb(200, 210, 225) 1px 2px 4px 0px',
        backgroundColor: '#FFFFFF'
    },
    text: {
        fontWeight: '600',
        color: '#505050'
    },
}));

export default function Jumbotron({ title, description }) {

    const classes = useStyles()
    
    return (
        <Container component="main" className={classes.main} maxWidth='lg' >
                <Typography variant="h4" component="h4" className={classes.text} gutterBottom>
                    {title}
                </Typography>
                <Typography variant="subtitle1" component="h2" className={classes.text} gutterBottom>
                    {description}
                </Typography>
            </Container>

    )
}