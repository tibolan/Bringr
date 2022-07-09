# Bringr 

**Create a Bringr object for your API**

When you create a Bringr object, you can specify all the parameters needed by your endpoint.
Thus, you can set the default configuration in one place, available for every future request.

```javascript
const myEndpoint = new Bringr({
    request: {
        default: {
            headers: {
                clientID: 'a12b3c4d5e6f7g8h9i',
                clientSecret: 'abcdef123456'
            },
            query: {
                origin: 'web'
            }
        },
        basePath: 'https://mock-bringr-demo.herokuapp.com'
    }    
})

// GET user
myEndpoint.GET('/user/1234')
    .then((res: BringrResponseType) => {
        // do something with the data fetched
    })
    .catch((res: BringrResponseType) => {
        // do something with your failed request
    })

// POST event
myEndpoint.POST({
    url: '/event',
    headers: {
        Authorization: 'Bearer ' + sessionStorage.getItem('access_token')        
    },
    json: {
            name: "Meeting with Aliens",
            date: "2023-01-01",
            time: "04:00:00",
            duration: "1d"
        }
})
    .then((res: BringrResponseType) => {
        // do something with the data fetched
    })
    .catch((res: BringrResponseType) => {
        // do something with your failed request
    })


```

