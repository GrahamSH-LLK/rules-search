import rules from "$lib/rules"
export const load = ({ params }) => {
console.log(rules[params.slug])
    return {
        rule: rules[params.slug].name,

        summary: rules[params.slug].summary
    }
}
