import React, { useState } from "react";
import Jumbotron from '../Jumbotron';
import styled from 'styled-components';
import PolicyInputPanel from '../PolicyInputPanel';


export default function PolicyPage() {

    return (
        <div>
            <Jumbotron 
            title="Policies" 
            description="Propose your own policies." />
            
            <PolicyInputPanel />
        </div>
    );
}