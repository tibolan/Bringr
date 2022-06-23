/**
 * Basic Awaiter
 * @param duration
 */
const sleep = async function sleep(duration = 1000) {
  return await new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, duration)
  })
}
export default sleep
