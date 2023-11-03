const defaultCallback = (entries: any[], observer: { unobserve: (arg0: any) => void; }) => {
    entries.forEach((entry) => {
        if(entry.isIntersecting) {
            entry.target.style.willChange = "opacity";
            entry.target.classList.add("animated");
            observer.unobserve(entry.target);
        }
    })
}

const defaultSelectionCallback = (selector) => {
    return document.querySelectorAll(selector);
}


const oculus = (selector:string = "[animation]",  callback = defaultCallback, selectionCallback = defaultSelectionCallback, options = {}) => {
    const templates = selectionCallback(selector);
    if(templates.length > 0) {
        const myObserver = new IntersectionObserver(callback, options);
        templates.forEach((entries) => {
            myObserver.observe(entries);
        });
    }
}

export default oculus;
