import React from 'react';
import produce, * as immer from 'immer';

const {
  createContext,
  memo,
  useMemo,
  useRef,
  useEffect,
  useCallback,
  useContext,
  useState
} = React;

export { immer };

const StateContext = createContext(null);
const DispatchContext = createContext(null);
const ActionsContext = createContext(null);

export function useStoreState() {
  return useContext(StateContext);
}

export function useStoreDispatch() {
  return useContext(DispatchContext);
}

export function useStoreActions() {
  return useContext(ActionsContext);
}

// boundActionCreators
export default function Provider({ initialState, actions = {}, children }) {
  const stateRef = useRef(initialState);
  const [state, setState] = useState(initialState);
  const getState = useCallback(() => stateRef.current, []);
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      window.getState2 = getState;
    }
  }, [getState]);
  const dispatch = useCallback(
    (actionId, fn) => {
      if (typeof actionId === 'function') return actionId(dispatch, getState);

      const stateNext = produce(getState(), fn);
      if (stateNext !== stateRef.current) {
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.log(actionId, stateNext);
        }
        stateRef.current = stateNext;
        setState(stateNext);
      }
    },
    [getState]
  );
  const boundActions = useMemo(() => bindActions(actions, dispatch), [
    actions,
    dispatch
  ]);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <ActionsContext.Provider value={boundActions}>
          {children}
        </ActionsContext.Provider>
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

export function connect(mapStateToProps) {
  return Component => {
    const MemoComponent = memo(Component);
    function Connected(props) {
      const state = useContext(StateContext);
      const dispatch = useContext(DispatchContext);
      const mapped = mapStateToProps(state, props);
      const nextProps = { dispatch, ...props, ...mapped };
      return <MemoComponent {...nextProps} />;
    }
    return Connected;
  };
}

// steal from https://github.com/reduxjs/redux/blob/master/src/bindActionCreators.ts
function bindAction(action, dispatch) {
  return function() {
    return dispatch(action.apply(this, arguments));
  };
}

function bindActions(actions, dispatch) {
  const boundActions = {};
  for (const key in actions) {
    const action = actions[key];
    if (typeof action === 'function') {
      boundActions[key] = bindAction(action, dispatch);
    } else if (typeof action === 'object') {
      boundActions[key] = bindActions(action, dispatch);
    }
  }
  return boundActions;
}
