export default function authHeader(accessToken: string) {
  return { Authorization: 'Bearer ' + accessToken };
}
