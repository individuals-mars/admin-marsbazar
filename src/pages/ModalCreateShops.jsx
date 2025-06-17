import React, { useEffect, useRef, useState } from 'react';
import { FaCloudArrowDown, FaXmark } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

const ModalCreateShops = () => {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const token = useSelector((state) => state.user.token);
  const [formData, setFormData] = useState({
    shopname: '',
    address: '',
    description: '',
    lat: '',
    lon: '',
    TariffPlan: 'basic', // Match schema's lowercase value
    logotype: null,
  });
  const [loading, setLoading] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file upload and convert to base64
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file && ['image/png', 'image/jpeg'].includes(file.type)) {
      try {
        const base64 = await convertToBase64(file);
        setFormData((prev) => ({ ...prev, logotype: base64 }));
      } catch (err) {
        toast.error('Failed to process image');
      }
    } else {
      toast.error('Please upload a PNG or JPG file');
    }
  };

  // Convert file to base64 string
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Validate latitude and longitude
  const isValidCoordinate = (lat, lon) => {
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    return (
      !isNaN(latNum) &&
      !isNaN(lonNum) &&
      latNum >= -90 &&
      latNum <= 90 &&
      lonNum >= -180 &&
      lonNum <= 180
    );
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!token) {
      toast.error('Please log in to create a shop.');
      navigate('/login');
      return;
    }

    if (!formData.shopname) return toast.error('Shop name is required');
    if (!formData.address) return toast.error('Address is required');
    if (!formData.lat || !formData.lon) return toast.error('Location coordinates are required');
    if (!['basic', 'standard', 'premium'].includes(formData.TariffPlan))
      return toast.error('Please select a valid tariff plan');
    if (!isValidCoordinate(formData.lat, formData.lon))
      return toast.error('Invalid latitude or longitude');

    setLoading(true);

    try {
      const payload = {
        shopname: formData.shopname,
        address: formData.address,
        description: formData.description,
        TariffPlan: formData.TariffPlan,
        location: {
          lat: parseFloat(formData.lat),
          lon: parseFloat(formData.lon),
        },
        logotype: '', // Omit the logotype
      };
      console.log('Payload:', payload); // Debug payload

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/shops`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create shop');
      }

      toast.success('Shop created successfully!');
      navigate('/shops');
    } catch (err) {
      console.error('Error creating shop:', err);
      if (err.message.includes('Unauthorized') || err.message.includes('Invalid token')) {
        toast.error('Session expired. Please log in again.');
        navigate('/login');
      } else {
        toast.error(err.message || 'Failed to create shop');
      }
    } finally {
      setLoading(false);
    }
  };

  // Load and initialize Yandex Map
  useEffect(() => {
    if (mapOpen) {
      const script = document.createElement('script');
      script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU';
      script.async = true;
      script.onload = () => {
        window.ymaps.ready(() => {
          const map = new window.ymaps.Map('yandexMap', {
            center: [41.311081, 69.240562], // Default center (e.g., Tashkent)
            zoom: 12,
          });

          map.events.add('click', (e) => {
            const coords = e.get('coords');
            const [lat, lon] = coords;

            // Reverse geocoding to get address
            window.ymaps.geocode(coords).then((res) => {
              const firstGeoObject = res.geoObjects.get(0);
              const address = firstGeoObject ? firstGeoObject.getAddressLine() : 'Address not found';

              setFormData((prev) => ({
                ...prev,
                lat: lat.toFixed(6),
                lon: lon.toFixed(6),
                address: address,
              }));

              toast.success(`Location selected: ${lat.toFixed(6)}, ${lon.toFixed(6)}, ${address}`);
              setMapOpen(false);
            }).catch((err) => {
              console.error('Geocoding error:', err);
              setFormData((prev) => ({
                ...prev,
                lat: lat.toFixed(6),
                lon: lon.toFixed(6),
                address: ' Street Buyuk Ipak Yuli, Mirzo-ulugbek Area, 100077, Uzbekistan',
              }));
              toast.error('Failed to fetch address');
              setMapOpen(false);
            });
          });

          mapRef.current = map;
        });
      };
      document.head.appendChild(script);

      // Cleanup script and map
      return () => {
        if (mapRef.current) {
          mapRef.current.destroy();
          mapRef.current = null;
        }
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    }
  }, [mapOpen]);

  return (
    <div className="bg-base-200 p-4">
      <div className="px-3">
        <h1 className="font-semibold text-xl">Create Shop</h1>
        <hr className="my-8 bg-base-350 opacity-10" />
      </div>
      <div>
        {/* Shop Logo */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex flex-col mx-3">
            <h2 className="font-semibold text-lg mb-2">Shop Logo</h2>
            <p className="text-xs text-base-350">Upload your shop logo (PNG or JPG)</p>
          </div>
          <div className="bg-base-100 px-10 py-5 rounded-lg h-50 w-170">
            {formData.logotype ? (
              <div className="relative">
                <img
                  src={formData.logotype}
                  alt="Shop Logo Preview"
                  className="w-full h-32 object-contain rounded-lg"
                />
                <button
                  onClick={() => setFormData((prev) => ({ ...prev, logotype: null }))}
                  className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                >
                  <FaXmark size={20} />
                </button>
              </div>
            ) : (
              <label
                htmlFor="logo-upload"
                className="border border-dashed border-base-300 rounded-lg p-8 flex flex-col items-center justify-center hover:bg-base-200 transition cursor-pointer"
              >
                <FaCloudArrowDown className="text-5xl text-base-350 mb-2" />
                <p className="text-sm">Upload an image or drag and drop</p>
                <p className="text-xs text-base-350">PNG, JPG</p>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>
        </div>

        <hr className="my-10 bg-base-350 opacity-10" />

        {/* Basic Info */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex flex-col mx-3">
            <h2 className="font-semibold text-lg mb-2">Basic Info</h2>
            <p className="text-xs text-base-350">Add basic info about your shop</p>
          </div>
          <div className="bg-base-100 p-6 rounded-lg shadow-md w-full md:w-[680px]">
            <div className="mb-4">
              <label htmlFor="shopname" className="mb-2 font-semibold block">
                Name
              </label>
              <input
                id="shopname"
                type="text"
                name="shopname"
                className="w-full border border-base-300 rounded-sm py-2 px-4"
                placeholder="Enter shop name"
                value={formData.shopname}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="description" className="mb-2 font-semibold block">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                className="w-full border border-base-300 rounded-sm py-3 px-4"
                placeholder="Enter description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        <hr className="my-10 bg-base-350 opacity-10" />

        {/* Location Info */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex flex-col mx-3">
            <h2 className="font-semibold text-lg mb-2">Location Info</h2>
            <p className="text-xs text-base-350">Add location info for your shop</p>
          </div>
          <div className="bg-base-100 p-6 rounded-lg shadow-md w-full md:w-[680px]">
            <div className="mb-4">
              <label htmlFor="address" className="mb-2 font-semibold block">
                Address
              </label>
              <input
                id="address"
                type="text"
                name="address"
                className="w-full border border-base-300 rounded-sm py-2 px-4"
                placeholder="Enter address"
                value={formData.address}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="lat" className="mb-2 font-semibold block">
                Latitude
              </label>
              <input
                id="lat"
                type="text"
                name="lat"
                value={formData.lat}
                onChange={handleInputChange}
                className="w-full border border-base-300 rounded-sm py-2 px-4"
                placeholder="Enter shop latitude"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="lon" className="mb-2 font-semibold block">
                Longitude
              </label>
              <input
                id="lon"
                type="text"
                name="lon"
                value={formData.lon}
                onChange={handleInputChange}
                className="w-full border border-base-300 rounded-sm py-2 px-4"
                placeholder="Enter shop longitude"
              />
            </div>
            <button
              onClick={() => setMapOpen(true)}
              className="text-sm text-success font-bold hover:underline"
            >
              Select on map
            </button>
          </div>
        </div>

        <hr className="my-10 bg-base-350 opacity-10" />

        {/* Tariff Info */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex flex-col mx-3">
            <h2 className="font-semibold text-lg mb-2">Tariff Info</h2>
            <p className="text-xs text-base-350">Select a tariff plan for your shop</p>
          </div>
          <div className="bg-base-100 p-6 rounded-lg shadow-md w-full md:w-[680px]">
            <div className="mb-4">
              <label htmlFor="TariffPlan" className="mb-2 font-semibold block">
                Tariff Plan
              </label>
              <select
                id="TariffPlan"
                name="TariffPlan"
                className="w-full border border-base-300 rounded-sm py-2 px-4 text-base-350"
                value={formData.TariffPlan}
                onChange={handleInputChange}
              >
                <option value="basic" className="text-gray-200 bg-base-200">Basic</option>
                <option value="standard" className="text-gray-200 bg-base-200">Standard</option>
                <option value="premium" className="text-gray-200 bg-base-200">Premium</option>
              </select>
            </div>
          </div>
        </div>

        <hr className="my-10 bg-base-350 opacity-10" />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end mt-4 gap-4">
        <button
          className="btn btn-outline btn-error"
          onClick={() => navigate(-1)}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          className="btn btn-outline btn-success"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Shop'}
        </button>
      </div>

      {/* Yandex Map Modal */}
      {mapOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg w-11/12 md:w-3/4 h-[80vh] relative">
            <button
              onClick={() => setMapOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
            >
              <FaXmark size={20} />
            </button>
            <div id="yandexMap" className="w-full h-full rounded-lg" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ModalCreateShops;