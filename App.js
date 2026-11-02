Vue.createApp({
    data() {
        return {
            records: []
        };
    },
    mounted() {
        this.getAllRecords();
    },
    methods: {
        getAllRecords() {
            this.records = [
                { id: 1, title: "Abbey Road", artist: "The Beatles", duration: 2832, publicationYear: 1969 },
                { id: 2, title: "Thriller", artist: "Michael Jackson", duration: 2537, publicationYear: 1982 },
                { id: 3, title: "Rumours", artist: "Fleetwood Mac", duration: 2400, publicationYear: 1977 }
            ];
        }
    }
}).mount("#app");