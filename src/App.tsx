import { BrowserRouter } from "react-router-dom";
import AuthProvider from "./components/security/AuthProvider.tsx";
import Header from "./components/layout/Header.tsx";
import Main from "./components/layout/Main.tsx";
import Footer from "./components/layout/Footer.tsx";

export default function App() {

  return (
      <BrowserRouter>
          <AuthProvider>
              <div className={"flex flex-col h-screen overflow-y-hidden justify-between"}>
                  <Header />
                  <Main />
                  <Footer />
              </div>
          </AuthProvider>
      </BrowserRouter>
  )
}
