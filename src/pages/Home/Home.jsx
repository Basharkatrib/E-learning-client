import Banner from "../../components/Banner/Banner";
import Benefits from "../../components/Benefits/Benefits";
import Courses from "../../components/Courses/Courses";
import FAQ from "../../components/FAQ/FAQ";
import Footer from "../../components/Footer/Footer";
import Slider from "../../components/Slider/Slider";
import Testimonials from "../../components/Testimonials/Testimonials";


function Home() {

    

    return (
        <div>
            <Banner />
            <Slider />
            <Benefits />
            <Courses />
            <Testimonials />
            <FAQ />
        </div>
    )
}
export default Home;
