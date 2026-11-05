const baseUrl = "http://localhost:5102/api/MusicRecords";
Vue.createApp({
    data() {
        return {
            records: [],
            searchTitle: "",
            searchArtist: "",
            searched: false
            newRecord: {
                title: "",
                artist: "",
                duration: 1,
                publicationYear: new Date().getFullYear()
            },
            message: ""
        };
    },
    created(){
        this.search();
    },

    mounted() {
        this.getAllRecords();
    },

    methods: {
        async getAllRecords() {
            try {
                const response = await axios.get(
                    "http://localhost:5102/api/MusicRecords"
                );

                this.records = response.data;

            } catch (error) {
                this.message = "Kunne ikke hente pladerne.";
            }
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
            this.search();
            }

        async addRecord() {
            this.message = "";

            try {
                const response = await axios.post(
                    "http://localhost:5102/api/MusicRecords",
                    this.newRecord
                );

                this.message = "Pladen er tilføjet!";

                await this.getAllRecords();

                this.newRecord = {
                    title: "",
                    artist: "",
                    duration: 1,
                    publicationYear: new Date().getFullYear()
                };

            } catch (error) {
                if (error.response) {
                    this.message = "Pladen kunne ikke tilføjes.";
                } else {
                    this.message = "Der kunne ikke oprettes forbindelse til serveren.";
                }
            }
        }
    }
}).mount("#app");
