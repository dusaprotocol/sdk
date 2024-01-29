// import { swapAmountIn } from './swapAmountIn'
// import { swapAmountOut } from './swapAmountOut'
// import { pricesAndBinsRelations } from './pricesAndBinsRelations'
// import { getLBPairsAndActiveIds } from './getLBPairsAndActiveIds'
import { addLiquidity } from './addLiquidity'
// import { removeLiquidity } from './removeLiquidity'

import dotenv from 'dotenv'
dotenv.config() // loads env variables

const main = async () => {
  await addLiquidity()
}

main()
