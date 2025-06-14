import ChurchGallery from "../components/ChurchGallery"
import { Link } from "react-router-dom"
import { ChevronLeft } from "lucide-react"
import { Button } from "../components/ui/Button"
import Layout from "../components/Layout"

// what is this for???

const Gallery = () => {
  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/">
            <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-amber-900 mb-2">Parish Gallery</h2>
          <p className="text-amber-700">Explore the beauty and sacred spaces of St. Augustine Parish</p>
        </div>

        <ChurchGallery />
      </div>
    </Layout>
  )
}

export default Gallery
