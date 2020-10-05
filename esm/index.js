import { ApolloServer } from 'apollo-server'
import { makeExecutableSchema } from 'graphql-tools'
import _ from 'lodash'

export const usingObjectPrefix = (obj, prefix) => {
  const result = { }
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith(prefix)) {
      const newKey = key.slice(prefix.length)
      result[newKey] = value
    }
  }
  return result
}

export const convertObjectKeyCase = (obj, convertCase) => {
  const result = { }
  for (const [key, value] of Object.entries(obj)) {
    const newKey = convertCase(key)
    result[newKey] = value
  }
  return result
}

export const makeHasuraRemoteServer = async ({
  port = 80,
  schema,
  typeDefs,
  resolvers,
  apolloServerOptions,
  convertCase = _.snakeCase,
}) => {
  const server = new ApolloServer({
    introspection: true,
    schema: schema ? schema : makeExecutableSchema({
      typeDefs,
      resolvers,
    }),
    context: ({ req: { headers } }) => {
      return ({
        headers,
        hasura: convertObjectKeyCase(usingObjectPrefix(headers, 'x-hasura-'), convertCase),
      })
    },
    ...apolloServerOptions,
  })

  return await server.listen({ port })
}
