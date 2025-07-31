import { Outlet, useLocation } from "react-router-dom";
import CoursesPage from "../../components/CoursesPage/CoursesPage";

export default function Courses(){
    const location = useLocation();
    const isCourseDetails = location.pathname.includes('/courses/') && location.pathname !== '/courses';
    
    return(
        <div>
            {!isCourseDetails && <CoursesPage />}
            <Outlet />
        </div>
    )
}