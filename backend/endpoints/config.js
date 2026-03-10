export default {
    type: "get",
    handler: (_, res) => res.status(200).json(global.config.game)
}