import { describe } from "vitest";
import {getCurveDistributionFromBinRange} from "./liquidityDistribution";
import {  WMAS as _WMAS, USDC as _USDC, TokenAmount } from "../v1entities";
import { ChainId } from "../constants";
import { parseUnits } from "../lib/ethers";

describe('distrib', ()=> {
  test('distrib', () => {
    const CHAIN_ID = ChainId.BUILDNET;
    const USDC = _USDC[CHAIN_ID];
    const WMAS = _WMAS[CHAIN_ID];
    expect(getCurveDistributionFromBinRange(8391254, [8391249, 8391253], [new TokenAmount(USDC, parseUnits('10',USDC.decimals)), new TokenAmount(WMAS, parseUnits('10', WMAS.decimals))])).not.toThrow()
  })
})