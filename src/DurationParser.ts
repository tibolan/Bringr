interface DurationUnitMapInterface {
    [key:string]: number
}
const durationUnitMap: DurationUnitMapInterface = {
    "ms": 1,
    "s": 1000,
    "m": 1000 * 60,
    "h": 1000 * 60 * 60,
    "d": 1000 * 60 * 60 * 24
}
const DurationParser = (durationAsString: string | number): number => {
    if (typeof durationAsString !== "string") return Number(durationAsString)
    // sanitize
    durationAsString = durationAsString.replace(/\s/g, "")
    // add space betaween values
    durationAsString = durationAsString.replace(/([a-z])(\d)/gi, (a, b, c) => {
        return `${b} ${c}`
    })
    // compute time
    return durationAsString
        .split(" ")
        .reduce((accumulator, currentValue): number => {
            return accumulator + ParseDuration(currentValue)
        }, 0)
}

const ParseDuration = (durationAsString: string): number => {
    durationAsString = durationAsString.replace(/\D+/, ($1) => ` ${$1}`)
    const [value, unit] = durationAsString.split(' ')
    return (durationUnitMap[unit] || 0) * Number(value)
}

export default DurationParser