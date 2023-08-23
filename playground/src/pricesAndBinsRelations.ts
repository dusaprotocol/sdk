import { Bin, REAL_ID_SHIFT } from '@dusalabs/sdk'

export const pricesAndBinsRelations = async () => {
  console.log('\n------- pricesAndBinsRelations() called -------\n')

  // This returns 1 because we're in the center bin
  console.log('getPriceFromId', Bin.getPriceFromId(REAL_ID_SHIFT, 100))

  // If bin step = 100, every bin jump is a 1% price shift (10_000 basis)
  console.log('1 bin jump', Bin.getPriceFromId(REAL_ID_SHIFT + 1, 100))

  // We can get the current active bin based on price
  console.log('getIdFromPrice', Bin.getIdFromPrice(20, 100))

  //  Considering a 5% price slippage
  const idSlippage = Bin.getIdSlippageFromPriceSlippage(0.05, 100)
  // We find the correct slippage
  console.log(
    '5% slippage',
    Bin.getPriceFromId(REAL_ID_SHIFT + idSlippage, 100)
  )
}
