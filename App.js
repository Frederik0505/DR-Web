Vue.createApp({
    data() {
        return {
            records: [],

            newRecord: {
                title: "",
                artist: "",
                duration: 1,
                publicationYear: new Date().getFullYear()
            },

            message: ""
        };
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
