const docs = {
  response: {
    "request.retry": {
      "desc": "Allow you to specify when & how to do a retry on a failed request"
    },
    "request.retry.condition": {
      "desc": "The condition that should be met to accept a retry",
      "accept": {
        number: "compare to the request status",
        string: "compare to the error name",
        boolean: "enable or not",
        function: {
          desc: 'should return a boolean value. The request and the response are pass as arguments',
          exemple: `condition: (response, request) => {
            return response.headers.foo === "baz" 
          }`
        }
      }
    },
    "request.retry.max": {
      "desc": "The maximum number of retry for the request",
      "accept": {
        number: 'an integer representing the maximum number of retry'
      }
    },
    "request.retry.delay": {
      "desc": "The delay to wait before trying a retry",
      "accept": {
        number: "an integer representing the delay in ms between two retry"
      }
    },
    "request.retry.attempt": {
      "desc": "The number of times where the request have been retried.",
      "readonly": true
    }
  }
}
export default docs
