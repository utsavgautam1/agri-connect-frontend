import { enqueueOfflineAction } from '../../services/offline';
import { incrementOfflineQueue } from '../slices/appSlice';

/**
 * OFFLINE_QUEUE_ACTIONS
 * These Redux action types will be intercepted when the device is offline
 * and stored in the offline queue instead of passing through.
 *
 * Add any action that modifies server state (POSTs / PUTs / DELETEs).
 */
const OFFLINE_QUEUE_ACTIONS = [
  'advisory/submitQuestion',
  'soil/submitReadings',
  'sms/sendAlert',
];

/**
 * offlineMiddleware
 *
 * Intercepts specific actions when the device is offline.
 * Stores them in AsyncStorage and updates the badge count in Redux.
 * The OfflineManager component (or a background task) replays them on reconnect.
 */
const offlineMiddleware = (store) => (next) => (action) => {
  const isOnline = store.getState().app?.isOnline ?? true;

  // Only intercept designated actions while offline
  if (!isOnline && OFFLINE_QUEUE_ACTIONS.includes(action.type)) {
    // Persist to AsyncStorage queue
    enqueueOfflineAction({
      type:    action.type,
      payload: action.payload,
    });

    // Update Redux badge counter
    store.dispatch(incrementOfflineQueue());

    // Dispatch a "queued" version so the screen can show feedback
    return next({
      ...action,
      meta: { ...(action.meta || {}), offlineQueued: true },
    });
  }

  return next(action);
};

export default offlineMiddleware;