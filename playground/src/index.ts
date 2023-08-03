// import { swapAmountIn } from './swapAmountIn'
// import { swapAmountOut } from './swapAmountOut'
// import { pricesAndBinsRelations } from './pricesAndBinsRelations'
import { getLBPairsAndActiveIds } from './getLBPairsAndActiveIds'
import dotenv from 'dotenv'

dotenv.config() // loads env variables

const main = async () => {
  // await swapAmountIn()
  // await swapAmountOut()
  // await pricesAndBinsRelations()
  await getLBPairsAndActiveIds()
}

main()
