export const LBQuoterABI = [
  {
    name: 'constructor',
    inputs: [
      {
        name: 'router',
        type: 'Address'
      },
      {
        name: 'factory',
        type: 'Address'
      }
    ]
  },
  {
    name: 'findBestPathFromAmountIn',
    inputs: [
      {
        name: 'route',
        type: 'Address[]'
      },
      {
        name: 'amountIn',
        type: 'u64'
      }
    ],
    outputs: {
      name: '',
      type: 'Quote'
    }
  },
  {
    name: 'findBestPathFromAmountOut',
    inputs: [
      {
        name: 'route',
        type: 'Address[]'
      },
      {
        name: 'amountOut',
        type: 'u64'
      }
    ],
    outputs: {
      name: '',
      type: 'Quote'
    }
  }
]
