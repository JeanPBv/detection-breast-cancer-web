import React from "react";
import { Link } from "react-router-dom";
import "./NavBar.css";
import {FaHome, FaUserInjured, FaMicroscope } from "react-icons/fa";

function NavBar() {
    return (
        <nav className="navbar">
            <div className="navbar-content">
                <ul className="nav-links">
                    <li className="home" ><Link to="/"><FaHome/> Inicio</Link></li>
                    <li><Link to="/pacientes/lista"><FaUserInjured/>  Lista de Pacientes</Link></li>
                    <li><Link to="/diagnosticos/lista"><FaMicroscope/>  Lista de Diagnósticos</Link></li>
                </ul>
            </div>
        </nav>
    );
}

export default NavBar;
