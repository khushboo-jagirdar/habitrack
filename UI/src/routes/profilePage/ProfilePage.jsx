import './profilePage.scss';
import List from '../../components/list/List';
import Chat from '../../components/chat/Chat';
import { useEffect, useState, useRef } from 'react';
import { updateUserProfile, fetchUserById, getSavedProperties } from '../../lib/userApi';
import { createProperty, fetchPropertiesByOwner, fetchPropertyById } from '../../lib/propertyApi';
import { getUserTransactions } from '../../lib/transactionApi';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

function ProfilePage() {
  const { user: authUser, updateUser } = useAuth();
  const [user, setUser] = useState(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ fullName: '', userType: '' });
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [properties, setProperties] = useState([]);
  const [savedProperties, setSavedProperties] = useState([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [transactionProperties, setTransactionProperties] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [propertyForm, setPropertyForm] = useState({
    title: '',
    address: '',
    price: '',
    type: 'buy',
    propertyType: 'house',
    bedroom: '1',
    bathroom: '1',
    latitude: '',
    longitude: ''
  });
  const [propertyImages, setPropertyImages] = useState([]);
  const fileInputRef = useRef();

  useEffect(() => {
    if (authUser) {
      setUser(authUser);
      setForm({ fullName: authUser.fullName, userType: authUser.userType });
      setPreview(authUser.avatar || null);
    }
  }, [authUser]);

  useEffect(() => {
    const userId = authUser?.id || authUser?._id;
    if (!userId) return;
    fetchUserById(userId)
      .then((fresh) => {
        setUser(fresh);
        setForm({ fullName: fresh.fullName, userType: fresh.userType });
        setPreview(fresh.avatar || null);
        // intentionally not calling updateUser here to avoid re-render loop
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.id]);

  const userId = authUser?.id || authUser?._id;

  useEffect(() => {
    if (!userId) return;
    fetchPropertiesByOwner(userId)
      .then(setProperties)
      .catch(() => setProperties([]));
  }, [userId]);

  // Fetch transactions
  useEffect(() => {
    if (!userId) return;
    setTransactionsLoading(true);
    getUserTransactions(userId)
      .then(async (txns) => {
        setTransactions(txns);
        if (!txns || txns.length === 0) {
          setTransactionProperties([]);
          return;
        }
        const props = await Promise.all(
          txns.map(t => fetchPropertyById(t.propertyId).catch(() => null))
        );
        setTransactionProperties(
          txns.map((t, i) => ({ ...t, property: props[i] })).filter(t => t.property)
        );
      })
      .catch(() => setTransactionProperties([]))
      .finally(() => setTransactionsLoading(false));
  }, [userId]);

  // Fetch saved properties
  useEffect(() => {
    if (!userId) return;
    setSavedLoading(true);
    getSavedProperties(userId)
      .then(async (data) => {
        const savedIds = data.savedProperties || [];
        if (savedIds.length === 0) {
          setSavedProperties([]);
          return;
        }
        // Fetch each saved property details
        const propertyPromises = savedIds.map(id => 
          fetchPropertyById(id).catch(() => null)
        );
        const results = await Promise.all(propertyPromises);
        setSavedProperties(results.filter(p => p !== null));
      })
      .catch(() => setSavedProperties([]))
      .finally(() => setSavedLoading(false));
  }, [userId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handlePropertyChange = (e) => {
    setPropertyForm({ ...propertyForm, [e.target.name]: e.target.value });
    setCreateError('');
  };

  const geocodeAddress = async (address) => {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    return { latitude: Number(data[0].lat), longitude: Number(data[0].lon) };
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 5) {
      setCreateError('You can upload up to 5 images.');
      setPropertyImages(files.slice(0, 5));
      return;
    }
    setPropertyImages(files);
    setCreateError('');
  };

  const handleCreateProperty = async (e) => {
    e.preventDefault();
    if (!user?.id) return;
    if (user.userType !== 'owner' && user.userType !== 'agent') {
      setCreateError('Only property owners and agents can create listings.');
      return;
    }
    if (propertyImages.length === 0) {
      setCreateError('Please upload at least one image.');
      return;
    }
    if (propertyImages.length > 5) {
      setCreateError('You can upload up to 5 images.');
      return;
    }
    setCreateLoading(true);
    setCreateError('');
    try {
      let latitude = propertyForm.latitude;
      let longitude = propertyForm.longitude;
      if (!latitude || !longitude) {
        const geo = await geocodeAddress(propertyForm.address);
        if (geo) {
          latitude = geo.latitude;
          longitude = geo.longitude;
        }
      }
      if (!latitude || !longitude) {
        setCreateError('Location not found. Please enter a more specific address or provide latitude/longitude.');
        setCreateLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('ownerId', user.id || user._id);
      formData.append('title', propertyForm.title);
      formData.append('address', propertyForm.address);
      formData.append('price', propertyForm.price);
      formData.append('type', propertyForm.type);
      formData.append('propertyType', propertyForm.propertyType);
      formData.append('bedroom', propertyForm.bedroom);
      formData.append('bathroom', propertyForm.bathroom);
      formData.append('latitude', latitude);
      formData.append('longitude', longitude);
      propertyImages.forEach((file) => formData.append('images', file));

      const created = await createProperty(formData);
      setProperties((prev) => [created, ...prev]);
      setPropertyForm({
        title: '',
        address: '',
        price: '',
        type: 'buy',
        propertyType: 'house',
        bedroom: '1',
        bathroom: '1',
        latitude: '',
        longitude: ''
      });
      setPropertyImages([]);
      setShowCreate(false);
    } catch (err) {
      setCreateError(err.message || 'Failed to create property');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const updated = await updateUserProfile(user.id || user._id, { ...form, avatar });
      setUser(updated);
      updateUser(updated);
      setEdit(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profilePage">
      <div className="details">
        <div className="wrapper">
          <div className="title">
            <h1>User Information</h1>
            {edit ? (
              <button onClick={() => setEdit(false)}>Cancel</button>
            ) : (
              <button onClick={() => setEdit(true)}>Update Profile</button>
            )}
          </div>
          <div className="info">
            <form onSubmit={handleUpdate} style={{width:'100%'}}>
              <span>Avatar: 
                <img src={preview || user?.avatar || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmgRRWWJoxWiRu5d3_NP3vVJNGIuRIlEjsPg&s"} alt="avatar" />
                {edit && (
                  <>
                    <input type="file" accept="image/*" ref={fileInputRef} style={{display:'none'}} onChange={handleAvatarChange} />
                    <button type="button" onClick={() => fileInputRef.current.click()}>Change</button>
                  </>
                )}
              </span>
              <span>
                Username: {edit ? (
                  <input name="fullName" value={form.fullName} onChange={handleChange} required />
                ) : <b>{user ? user.fullName : 'Guest'}</b>}
              </span>
              <span>
                E-mail: <b>{user ? user.email : '-'}</b>
              </span>
              <span>
                User Type: {edit ? (
                  <select name="userType" value={form.userType} onChange={handleChange} required>
                    <option value="buyer">Buyer/Renter</option>
                    <option value="agent">Property Agent</option>
                    <option value="owner">Property Owner</option>
                  </select>
                ) : <b>{user ? user.userType : '-'}</b>}
              </span>
              <span>
                User ID: <b>{user ? (user.id || user._id) : '-'}</b>
              </span>
              <span>
                Aadhaar: {user?.aadhaarVerified ? (
                  <b style={{color:'#16a34a'}}>🪪 Verified</b>
                ) : (
                  <Link to="/verify-aadhaar" style={{color:'#d97706', fontWeight:600}}>🪪 Verify Now</Link>
                )}
              </span>
              {edit && (
                <button type="submit" disabled={loading} style={{marginTop:12}}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              )}
              {error && <div style={{color:'red'}}>{error}</div>}
            </form>
          </div>
          <div className="title">
            <h1>My List</h1>
            {(user?.userType === 'owner' || user?.userType === 'agent') && (
              <button onClick={() => setShowCreate(!showCreate)}>
                {showCreate ? 'Close' : 'Create New Post'}
              </button>
            )}
          </div>
          {user?.userType !== 'owner' && user?.userType !== 'agent' && (
            <div className="emptyState">Only property owners and agents can create listings.</div>
          )}
          {showCreate && (user?.userType === 'owner' || user?.userType === 'agent') && (
            <form className="propertyForm" onSubmit={handleCreateProperty}>
              <div className="propertyFormGrid">
                <input type="text" name="title" placeholder="Property title" value={propertyForm.title} onChange={handlePropertyChange} required />
                <input type="text" name="address" placeholder="Address (auto-geocoded for map)" value={propertyForm.address} onChange={handlePropertyChange} required />
                <input type="number" name="price" placeholder="Price (₹)" value={propertyForm.price} onChange={handlePropertyChange} min="1" required />
                <select name="type" value={propertyForm.type} onChange={handlePropertyChange}>
                  <option value="buy">For Sale (Buy)</option>
                  <option value="rent">For Rent</option>
                </select>
                <select name="propertyType" value={propertyForm.propertyType} onChange={handlePropertyChange}>
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="condo">Condo</option>
                  <option value="land">Land</option>
                  <option value="other">Other</option>
                </select>
                <input type="number" name="bedroom" placeholder="Bedrooms" value={propertyForm.bedroom} onChange={handlePropertyChange} min="0" required />
                <input type="number" name="bathroom" placeholder="Bathrooms" value={propertyForm.bathroom} onChange={handlePropertyChange} min="0" required />
                <input type="file" name="images" accept="image/*" multiple onChange={handleImageChange} required />
                <input type="number" name="latitude" placeholder="Latitude (optional — auto-detected)" value={propertyForm.latitude} onChange={handlePropertyChange} step="0.0001" />
                <input type="number" name="longitude" placeholder="Longitude (optional — auto-detected)" value={propertyForm.longitude} onChange={handlePropertyChange} step="0.0001" />
              </div>
              {propertyImages.length > 0 && (
                <div className="imageCount">Selected images: {propertyImages.length}/5</div>
              )}
              {createError && <div className="errorMessage">{createError}</div>}
              <button type="submit" disabled={createLoading}>
                {createLoading ? 'Creating...' : 'Publish Property'}
              </button>
            </form>
          )}
          {user?.userType === 'owner' && (
            <>
              {properties.length === 0 ? (
                <div className="emptyState">No properties yet. Create your first listing above.</div>
              ) : (
                <List items={properties} />
              )}
            </>
          )}
          <div className="title">
            <h1>Saved List</h1> 
          </div>
          {savedLoading ? (
            <div className="emptyState">Loading saved properties...</div>
          ) : savedProperties.length === 0 ? (
            <div className="emptyState">No saved properties yet. Save properties you like from their detail page.</div>
          ) : (
            <List items={savedProperties} />
          )}
          <div className="title">
            <h1>My Transactions</h1>
          </div>
          {transactionsLoading ? (
            <div className="emptyState">Loading transactions...</div>
          ) : transactionProperties.length === 0 ? (
            <div className="emptyState">No transactions yet. Buy or rent a property to see it here.</div>
          ) : (
            <div className="transactionList">
              {transactionProperties.map((t) => (
                <div key={t._id} className="transactionItem">
                  <Link to={`/property/${t.propertyId}`}>
                    <div className="transactionCard">
                      {t.property?.images?.[0] && (
                        <img
                          src={t.property.images[0].startsWith('/uploads')
                            ? `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api$/, '') : ''}${t.property.images[0]}`
                            : t.property.images[0]}
                          alt={t.property.title}
                        />
                      )}
                      <div className="transactionInfo">
                        <h3>{t.property?.title || 'Property'}</h3>
                        <p>{t.property?.address}</p>
                        <span className={`txnBadge ${t.type}`}>
                          {t.type === 'buy' ? '🏠 Purchased' : '🔑 Rented'}
                        </span>
                        <span className="txnAmount">₹{Number(t.amount).toLocaleString('en-IN')}</span>
                        <small>Card ending in {t.paymentLast4} · {new Date(t.createdAt).toLocaleDateString('en-IN')}</small>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="chatContainer">
        <div className="wrapper">
          <Chat />
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;

