import './ProfilePage.css'

export default function Content() {
return (
    <div style ={{maxWidth: "550px", margin: "0px auto", marginTop:"50px"}}>
     <div style = {{margin: "18px 0px", borderBottom:"1px solid grey"}}>
<div style = {{display:"flex", justifyContent: "space-around"}}>
<div>
 <img src='https://assets.pokemon.com/assets/cms2/img/pokedex/full/001.png' alt = "profile" width = "160px" height = "160px" style ={{borderRadius: "80px"}}/>


</div>
<div>
  <h2> Poker 123</h2>
  <h3>poker123@gmail.com </h3>
  <div style ={{display: "flex", justifyContent: "space-between", width: "100%"}}>
    <h6> 30 Posts</h6>&nbsp;
    <h6> 20 Followers</h6>&nbsp;
    <h6> 30 Following</h6>
  </div>
  <button className = 'btn btn-secondary'onClick={()=>setEditModal(true)} style={{backgroundColor:"white", color: "black"}}> Edit Profile</button>
  
  </div>
</div>
<br/>
<ul className ='profileTabBtns'>
      <li className = "nav-item">
        <button> POST</button>
        </li>
      <li className = "nav-item">
      <button> SAVED</button>
      </li>
      <li className = "nav-item">
      <button>TAGGED</button>
    </li>
    </ul>
     </div>

  
</div>
    
    
     )
}
