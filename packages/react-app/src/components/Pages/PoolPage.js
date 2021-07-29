import React, { useEffect, useState } from "react";
import Jumbotron from '../Jumbotron';
import LiquidityInputPanel from '../LiquidityInputPanel';
import { ethers } from "ethers";



export default function PoolPage() {


    
    return (
        <div>
            <Jumbotron title="Provide Liquidity" description="Liquidity providers earn a 0.3% fee on all trades proportional to their share of the pool." />
            <LiquidityInputPanel />
        </div>
    );
}


