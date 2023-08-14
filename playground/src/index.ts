// import { swapAmountIn } from './swapAmountIn'
// import { swapAmountOut } from './swapAmountOut'
// import { pricesAndBinsRelations } from './pricesAndBinsRelations'
// import { getLBPairsAndActiveIds } from './getLBPairsAndActiveIds'
import { addLiquidity } from './addLiquidity'

import dotenv from 'dotenv'
dotenv.config() // loads env variables

const main = async () => {
  // await swapAmountIn()
  // await swapAmountOut()
  // await pricesAndBinsRelations()
  // await getLBPairsAndActiveIds()
  await addLiquidity()
}

main()
