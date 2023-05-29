export const LBFactoryABI = [
  {
    name: 'constructor',
    inputs: [
      {
        name: 'feeRecipient',
        type: 'string'
      },
      {
        name: 'flashloanFee',
        type: 'u64'
      }
    ]
  },
  {
    name: 'getLBPairInformation',
    inputs: [
      {
        name: 'tokenA',
        type: 'Address'
      },
      {
        name: 'tokenB',
        type: 'Address'
      },
      {
        name: 'binStep',
        type: 'u32'
      }
    ],
    outputs: {
      name: '',
      type: 'LBPairInformation'
    }
  },
  {
    name: 'getPreset',
    inputs: [
      {
        name: 'binStep',
        type: 'u32'
      }
    ],
    outputs: {
      name: '',
      type: 'Preset'
    }
  },
  {
    name: 'getAllBinSteps',
    inputs: [],
    outputs: {
      name: '',
      type: 'u64[]'
    }
  },
  {
    name: 'getAvailableLBPairBinSteps',
    inputs: [
      {
        name: 'tokenA',
        type: 'Address'
      },
      {
        name: 'tokenB',
        type: 'Address'
      }
    ],
    outputs: {
      name: '',
      type: 'u32[]'
    }
  },
  {
    name: 'setLBPairInformation',
    inputs: [
      {
        name: 'tokenA',
        type: 'Address'
      },
      {
        name: 'tokenB',
        type: 'Address'
      },
      {
        name: 'pairInformation',
        type: 'LBPairInformation'
      }
    ]
  },
  {
    name: 'createLBPair',
    inputs: [
      {
        name: 'tokenA',
        type: 'Address'
      },
      {
        name: 'tokenB',
        type: 'Address'
      },
      {
        name: 'binStep',
        type: 'u32'
      },
      {
        name: 'activeId',
        type: 'u32'
      }
    ],
    outputs: {
      name: '',
      type: 'Address'
    }
  },
  {
    name: 'setLBPairIgnored',
    inputs: [
      {
        name: 'tokenA',
        type: 'Address'
      },
      {
        name: 'tokenB',
        type: 'Address'
      },
      {
        name: 'binStep',
        type: 'u32'
      },
      {
        name: 'ignored',
        type: 'bool'
      }
    ]
  },
  {
    name: 'setPreset',
    inputs: [
      {
        name: 'preset',
        type: 'Preset'
      }
    ]
  },
  {
    name: 'removePreset',
    inputs: [
      {
        name: 'binStep',
        type: 'u32'
      }
    ]
  },
  {
    name: 'setFeesParametersOnPair',
    inputs: [
      {
        name: 'tokenA',
        type: 'Address'
      },
      {
        name: 'tokenB',
        type: 'Address'
      },
      {
        name: 'fp',
        type: 'FeeParameters'
      }
    ]
  },
  {
    name: 'setFlashLoanFee',
    inputs: [
      {
        name: 'flashloanFee',
        type: 'u64'
      }
    ]
  },
  {
    name: 'setFactoryLockedState',
    inputs: [
      {
        name: 'locked',
        type: 'bool'
      }
    ]
  },
  {
    name: 'addQuoteAsset',
    inputs: [
      {
        name: 'quoteAsset',
        type: 'Address'
      }
    ]
  },
  {
    name: 'removeQuoteAsset',
    inputs: [
      {
        name: 'quoteAsset',
        type: 'Address'
      }
    ]
  },
  {
    name: 'setFeeRecipient',
    inputs: [
      {
        name: '_feeRecipient',
        type: 'Address'
      }
    ]
  },
  {
    name: 'forceDecay',
    inputs: [
      {
        name: 'pairAddress',
        type: 'Address'
      }
    ]
  }
]
