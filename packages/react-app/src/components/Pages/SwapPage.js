import React, { useEffect, useState } from "react";
import Jumbotron from '../Jumbotron';
import CurrencyInputPanel from '../CurrencyInputPanel';
import { ethers } from "ethers";



export default function SwapPage() {


    
    return (
        <div>
            <Jumbotron title="Swap" description="Buy or sell SYC tokens. SYC tokens grant you proportional power in the mutual." />
            <CurrencyInputPanel />
            
        </div>
    );
}


