import { getURLAndInit } from '../misc/request-helper';

const endpoint = '/configs';

export async function fetchConfigs(apiConfig) {
  const { url, init } = getURLAndInit(apiConfig);
  return await fetch(url + endpoint, init);
}

// TODO support PUT /configs
// req body
// { Path: string }

function configsPatchWorkaround(o) {
  // backward compatibility for older clash  using `socket-port`
  if ('socks-port' in o) {
    o['socket-port'] = o['socks-port'];
  }
  return o;
}

export async function updateConfigs(apiConfig, o) {
  const { url, init } = getURLAndInit(apiConfig);
  return await fetch(url + endpoint, {
    ...init,
    method: 'PATCH',
    // mode: 'cors',
    body: JSON.stringify(configsPatchWorkaround(o))
  });
}

export async function reloadConfigs(apiConfig, o = null) {
  const { url, init } = getURLAndInit(apiConfig);
  o = o ? o : '/root/.config/clash/config.yaml';
  return await fetch(url + endpoint, {
    ...init,
    method: 'PUT',
    // mode: 'cors',
    body: JSON.stringify({ path: o })
  });
}
