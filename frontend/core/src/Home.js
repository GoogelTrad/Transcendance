
import "./App.css"

function Home()
{
    return (
        <div>
            <h1>HOME</h1>
            {user ? (
                <div>   
                    <p>Nom : {user.name}</p>
                    <p>Email : {user.email}</p>
                </div>
            ) : (
                <p>Aucun utilisateur trouvé.</p>
            )}
        </div>
    );
}

export default Home;