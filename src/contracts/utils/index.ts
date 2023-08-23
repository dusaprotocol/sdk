import {
  Client,
  EventPoller,
  IEvent,
  IEventFilter,
  ON_MASSA_EVENT_DATA,
  ON_MASSA_EVENT_ERROR
} from '@massalabs/massa-web3'

interface IEventPollerResult {
  isError: boolean
  events: IEvent[]
}

const MASSA_EXEC_ERROR = 'massa_execution_error'

export const pollAsyncEvents = async (
  web3Client: Client,
  opId: string
): Promise<IEventPollerResult> => {
  // determine the last slot
  const nodeStatusInfo = await web3Client.publicApi().getNodeStatus()

  // set the events filter
  const eventsFilter: IEventFilter = {
    start: nodeStatusInfo.last_slot,
    end: null,
    original_caller_address: null,
    original_operation_id: opId,
    emitter_address: null,
    is_final: false
  }

  const eventPoller = EventPoller.startEventsPolling(
    eventsFilter,
    1000,
    web3Client
  )

  return new Promise((resolve, reject) => {
    eventPoller.on(ON_MASSA_EVENT_DATA, (events: Array<IEvent>) => {
      const errorEvents: IEvent[] = events.filter((e) =>
        e.data.includes(MASSA_EXEC_ERROR)
      )
      if (errorEvents.length > 0) {
        return resolve({
          isError: true,
          events: errorEvents
        })
      }

      if (events.length > 0) {
        return resolve({
          isError: false,
          events
        })
      } else {
        console.log('No events have been emitted during deployment')
      }
    })
    eventPoller.on(ON_MASSA_EVENT_ERROR, (error: Error) => {
      console.log('Event Data Error:', error)
      return reject(error)
    })
  })
}
