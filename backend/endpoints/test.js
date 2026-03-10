export default {
    type: "post",
    schema: {
        test: {
            required: true,
            type: "string",
            match: /[a-z]/
        }
    },
    run: (req, res) => res.status(200).json(req.body.test)
}