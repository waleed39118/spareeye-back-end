const CarRequest = require('../models/CarRequest');


const createCarRequest = async (req, res) => {
  try {
    const { title, description, carModel, budget } = req.body;

    if (title === undefined) {
      return res.status(400).json({ message: 'Title is required' });
    }
    if (title === null) {
      return res.status(400).json({ message: 'Title is required' });
    }
    if (title === '') {
      return res.status(400).json({ message: 'Title is required' });
    }

    if (description === undefined) {
      return res.status(400).json({ message: 'Description is required' });
    }
    if (description === null) {
      return res.status(400).json({ message: 'Description is required' });
    }
    if (description === '') {
      return res.status(400).json({ message: 'Description is required' });
    }

    if (carModel === undefined) {
      return res.status(400).json({ message: 'Car model is required' });
    }
    if (carModel === null) {
      return res.status(400).json({ message: 'Car model is required' });
    }
    if (carModel === '') {
      return res.status(400).json({ message: 'Car model is required' });
    }

    if (budget === undefined) {
      return res.status(400).json({ message: 'Budget is required' });
    }
    if (budget === null) {
      return res.status(400).json({ message: 'Budget is required' });
    }

  let userId = null;
    if (req.user !== undefined) {
      if (req.user !== null) {
        if (req.user._id !== undefined) {
          if (req.user._id !== null) {
            userId = req.user._id;
          }
        }
      }
    }

    if (userId === null) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const newRequest = new CarRequest({
      title,
      description,
      carModel,
      budget,
      requestedBy: userId
    });

    await newRequest.save();
    return res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error creating car request:', error);
    return res.status(500).json({ message: 'An error occurred while creating the request' });
  }
};

const getUserCarRequests = async (req, res) => {
  try {
    // determine user id
    let userId = null;
    if (req.user !== undefined) {
      if (req.user !== null) {
        if (req.user._id !== undefined) {
          if (req.user._id !== null) {
            userId = req.user._id;
          }
        }
      }
    }

    if (userId === null) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const requests = await CarRequest.find({ requestedBy: userId }).sort({ createdAt: -1 });
    return res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching user car requests:', error);
    return res.status(500).json({ message: 'An error occurred while fetching requests' });
  }
};


const deleteCarRequest = async (req, res) => {
  try {
    const { id } = req.params;

    let userId = null;
    if (req.user !== undefined) {
      if (req.user !== null) {
        if (req.user._id !== undefined) {
          if (req.user._id !== null) {
            userId = req.user._id;
          }
        }
      }
    }

    if (userId === null) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const deleted = await CarRequest.findOneAndDelete({ _id: id, requestedBy: userId });

    if (deleted === null) {
      return res.status(404).json({ message: 'Request not found or not authorized to delete' });
    }

    return res.status(200).json({ message: 'Request deleted successfully' });
  } catch (error) {
    console.error('Error deleting car request:', error);
    return res.status(500).json({ message: 'An error occurred while deleting the request' });
  }
};

module.exports = {
  createCarRequest,
  getUserCarRequests,
  deleteCarRequest
};
