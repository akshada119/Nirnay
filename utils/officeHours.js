const DAYS = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday"
];

const DAY_NAMES = {
    sunday: "Sunday",
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday"
};

function formatTime(time) {
    if (!time) return "";

    const [hours, minutes] = time.split(":").map(Number);

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });
}

function getOfficeStatus(officeHours) {

    if (!officeHours) {
        return {
            isOpen: false,
            message: "Hours not available"
        };
    }

    const now = new Date();

    const currentDay = DAYS[now.getDay()];
    const today = officeHours[currentDay];

    // Today's office is closed
    if (!today || !today.isOpen) {

        for (let i = 1; i <= 7; i++) {

            const nextIndex = (now.getDay() + i) % 7;
            const nextDay = DAYS[nextIndex];
            const nextHours = officeHours[nextDay];

            if (nextHours && nextHours.isOpen && nextHours.open) {

                const dayText =
                    i === 1
                        ? "tomorrow"
                        : DAY_NAMES[nextDay];

                return {
                    isOpen: false,
                    message: `Closed today · Opens ${dayText} at ${formatTime(nextHours.open)}`
                };
            }
        }

        return {
            isOpen: false,
            message: "Closed today"
        };
    }

    if (!today.open || !today.close) {
        return {
            isOpen: false,
            message: "Hours not available"
        };
    }

    const [openHour, openMinute] =
        today.open.split(":").map(Number);

    const [closeHour, closeMinute] =
        today.close.split(":").map(Number);

    const currentMinutes =
        now.getHours() * 60 + now.getMinutes();

    const openingMinutes =
        openHour * 60 + openMinute;

    const closingMinutes =
        closeHour * 60 + closeMinute;

    // OPEN
    if (
        currentMinutes >= openingMinutes &&
        currentMinutes < closingMinutes
    ) {
        return {
            isOpen: true,
            message: `Open now · Closes at ${formatTime(today.close)}`
        };
    }

    // BEFORE OPENING
    if (currentMinutes < openingMinutes) {
        return {
            isOpen: false,
            message: `Closed now · Opens at ${formatTime(today.open)}`
        };
    }

    // AFTER CLOSING
    for (let i = 1; i <= 7; i++) {

        const nextIndex = (now.getDay() + i) % 7;
        const nextDay = DAYS[nextIndex];
        const nextHours = officeHours[nextDay];

        if (nextHours && nextHours.isOpen && nextHours.open) {

            const dayText =
                i === 1
                    ? "tomorrow"
                    : DAY_NAMES[nextDay];

            return {
                isOpen: false,
                message: `Closed now · Opens ${dayText} at ${formatTime(nextHours.open)}`
            };
        }
    }

    return {
        isOpen: false,
        message: "Closed now"
    };
}

module.exports = {
    getOfficeStatus
};