const baseUrl = "https://localhost:5001/api/records";
Vue.createApp({
    data() {
        return {
            records: [], 
            searchTitle: "",
            searchArtist: "",
            searched: false
        };
    },
    created(){
        this.search();
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
        },

        async search(){
            try {
            const params = {};
            if (this.searchTitle) params.Title = this.searchTitle;
            if (this.searchArtist) params.Artist = this.searchArtist;
            const response = await axios.get(baseUrl, { params });
            this.records = response.data ?? [];
            }
            catch (error) {
                console.error(error);
                this.records = [];
            }
            finally {
                this.searched = true;
            }
        },
        clearSearch() {
            this.searchTitle = "";
            this.searchArtist = "";
            this.searched();
            }
    }
}).mount("#app");