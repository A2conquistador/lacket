export default {
    type: "get",
    run: (_, res) => res.status(200).json("hello world")
}