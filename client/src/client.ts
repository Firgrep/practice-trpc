import { createTRPCProxyClient, createWSClient, splitLink, httpBatchLink, loggerLink, wsLink } from "@trpc/client";
import { AppRouter } from '../../server/api'

const wsClient = createWSClient({
    url: "ws://localhost:3000/trpc",
})

const client = createTRPCProxyClient<AppRouter>({
    links: [
        loggerLink(), //must come before httpBatchLink since the latter makes the actual request
        splitLink({
            condition: op => {
                return op.type === "subscription"
            },
            true: wsLink({
            client: wsClient
            }),
            false: httpBatchLink({
                url: "http://localhost:3000/trpc",
                headers: { "Authorizaion": "TOKEN"}
            })
        }),
       
        // httpBatchLink({
        //     url: "http://localhost:3000/trpc",
        //     headers: { "Authorizaion": "TOKEN"}
        // })
    ]
});

document.addEventListener("click", () => {
    client.users.update.mutate({userId: "1", name: "Thomas"})
})

async function main() {
    client.users.onUpdate.subscribe(undefined, {
        onData: id => {
            console.log("Updated", id)
        },
    })

    wsClient.close()
}

// OLDER
// async function main() {
//     const result = await client.secretData.query()
//     console.log(result);
// }

main();
