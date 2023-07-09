import { useQuery } from "@tanstack/react-query"
import axios from "axios"

interface usr
{
    name: string,
    id: number
}

const userFetch = ()=>{
    return (
        axios
        .get("http://localhost:9000/api/auth/login", { withCredentials: true })
        .then((res)=> res.data)
    );
}

// const userFetch = ()=>{
//     return (
//         axios
//         .get("http://localhost:9000/api/auth/login")
//         .then((res)=> res.data)
//     );
// }

const useAuth = () => {

const query = useQuery<usr[], Error>({
    queryKey: ['users'],
    queryFn: userFetch
});

return query;

}

export default useAuth;