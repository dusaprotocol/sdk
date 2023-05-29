export const LBPairABI = [
  {
    name: 'constructor',
    inputs: [
      {
        name: 'factory',
        type: 'Address'
      },
      {
        name: 'tokenX',
        type: 'Address'
      },
      {
        name: 'tokenY',
        type: 'Address'
      },
      {
        name: 'activeId',
        type: 'u32'
      },
      {
        name: 'oracleSampleLifetime',
        type: 'u32'
      },
      {
        name: 'fp',
        type: 'FeeParameters'
      }
    ]
  },
  {
    name: 'swap',
    inputs: [
      {
        name: 'swapForY',
        type: 'bool'
      },
      {
        name: 'to',
        type: 'Address'
      }
    ],
    outputs: {
      name: '',
      type: 'u64'
    }
  },
  {
    name: 'flashLoan',
    inputs: [
      {
        name: 'token',
        type: 'IERC20'
      },
      {
        name: 'amount',
        type: 'u64'
      }
    ]
  },
  {
    name: 'mint',
    inputs: [
      {
        name: 'ids',
        type: 'u64[]'
      },
      {
        name: 'distributionX',
        type: 'u64[]'
      },
      {
        name: 'distributionY',
        type: 'u64[]'
      },
      {
        name: 'to',
        type: 'Address'
      }
    ]
  },
  {
    name: 'burn',
    inputs: [
      {
        name: 'ids',
        type: 'u64[]'
      },
      {
        name: 'amounts',
        type: 'u64[]'
      },
      {
        name: 'to',
        type: 'Address'
      }
    ],
    outputs: {
      name: '',
      type: 'BurnReturn'
    }
  },
  {
    name: 'collectFees',
    inputs: [
      {
        name: 'account',
        type: 'Address'
      },
      {
        name: 'ids',
        type: 'u64[]'
      }
    ],
    outputs: {
      name: '',
      type: 'GetFeesReturn'
    }
  },
  {
    name: 'collectProtocolFees',
    inputs: [],
    outputs: {
      name: '',
      type: 'GetFeesReturn'
    }
  },
  {
    name: 'pendingFees',
    inputs: [
      {
        name: 'account',
        type: 'Address'
      },
      {
        name: 'ids',
        type: 'u64[]'
      }
    ],
    outputs: {
      name: '',
      type: 'GetFeesReturn'
    }
  },
  {
    name: 'getUserBins',
    inputs: [
      {
        name: 'account',
        type: 'Address'
      }
    ],
    outputs: {
      name: '',
      type: 'u32[]'
    }
  },
  {
    name: 'getPairInformation',
    inputs: [],
    outputs: {
      name: '',
      type: 'PairInformation'
    }
  },
  {
    name: 'getBin',
    inputs: [
      {
        name: 'id',
        type: 'u32'
      }
    ],
    outputs: {
      name: '',
      type: 'Bin'
    }
  },
  {
    name: 'getGlobalFees',
    inputs: [],
    outputs: {
      name: '',
      type: 'GetGlobalFeesReturn'
    }
  },
  {
    name: 'getOracleParameters',
    inputs: [],
    outputs: {
      name: '',
      type: 'OracleParameters'
    }
  },
  {
    name: 'getOracleSampleFrom',
    inputs: [
      {
        name: 'timeDelta',
        type: 'u64'
      }
    ],
    outputs: {
      name: '',
      type: 'OracleSampleReturn'
    }
  },
  {
    name: 'increaseOracleLength',
    inputs: [
      {
        name: 'newSize',
        type: 'u32'
      }
    ]
  },
  {
    name: 'setFeesParameters',
    inputs: [
      {
        name: 'fp',
        type: 'FeeParameters'
      }
    ]
  },
  {
    name: 'forceDecay',
    inputs: []
  },
  {
    name: 'findFirstNonEmptyBinId',
    inputs: [
      {
        name: 'id',
        type: 'u32'
      },
      {
        name: 'sentTokenY',
        type: 'bool'
      }
    ],
    outputs: {
      name: '',
      type: 'u32'
    }
  },
  {
    name: 'name',
    inputs: [],
    outputs: {
      name: '',
      type: 'string'
    }
  },
  {
    name: 'symbol',
    inputs: [],
    outputs: {
      name: '',
      type: 'string'
    }
  },
  {
    name: 'totalSupply',
    inputs: [
      {
        name: 'id',
        type: 'u64'
      }
    ],
    outputs: {
      name: '',
      type: 'u64'
    }
  },
  {
    name: 'balanceOf',
    inputs: [
      {
        name: 'account',
        type: 'Address'
      },
      {
        name: 'id',
        type: 'u64'
      }
    ],
    outputs: {
      name: '',
      type: 'u64'
    }
  },
  {
    name: 'balanceOfBatch',
    inputs: [
      {
        name: 'accounts',
        type: 'Address[]'
      },
      {
        name: 'ids',
        type: 'u64[]'
      }
    ],
    outputs: {
      name: '',
      type: 'u64[]'
    }
  },
  {
    name: 'isApprovedForAll',
    inputs: [
      {
        name: 'owner',
        type: 'Address'
      },
      {
        name: 'spender',
        type: 'Address'
      }
    ],
    outputs: {
      name: '',
      type: 'bool'
    }
  },
  {
    name: 'safeTransferFrom',
    inputs: [
      {
        name: 'from',
        type: 'Address'
      },
      {
        name: 'to',
        type: 'Address'
      },
      {
        name: 'id',
        type: 'u64'
      },
      {
        name: 'amount',
        type: 'u64'
      }
    ]
  },
  {
    name: 'safeBatchTransferFrom',
    inputs: [
      {
        name: 'from',
        type: 'Address'
      },
      {
        name: 'to',
        type: 'Address'
      },
      {
        name: 'ids',
        type: 'u64[]'
      },
      {
        name: 'amounts',
        type: 'u64[]'
      }
    ]
  },
  {
    name: '_setApprovalForAll',
    inputs: [
      {
        name: 'owner',
        type: 'Address'
      },
      {
        name: 'spender',
        type: 'Address'
      },
      {
        name: 'approved',
        type: 'bool'
      }
    ]
  }
]
