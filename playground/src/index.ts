// import { swapAmountIn } from './swapAmountIn'
// import { swapAmountOut } from './swapAmountOut'
// import { pricesAndBinsRelations } from './pricesAndBinsRelations'
// import { getLBPairsAndActiveIds } from './getLBPairsAndActiveIds'
// import { addLiquidity } from './addLiquidity'
// import { removeLiquidity } from './removeLiquidity'
import { erc20Balances } from './erc20Balances'

import dotenv from 'dotenv'
dotenv.config() // loads env variables

const main = async () => {
  await erc20Balances()
}

main()
