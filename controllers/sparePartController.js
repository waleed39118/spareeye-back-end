const SparePart = require('../models/SparePart');


const createSparePart = async (req, res) => {
  try {
    const { name, description, price, carModel } = req.body;

    if (name === undefined) {
      return res.status(400).json({ message: 'Name is required' });
    }
    if (name === null) {
      return res.status(400).json({ message: 'Name is required' });
    }
    if (name === '') {
      return res.status(400).json({ message: 'Name is required' });
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

    if (price === undefined) {
      return res.status(400).json({ message: 'Price is required' });
    }
    if (price === null) {
      return res.status(400).json({ message: 'Price is required' });
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

    const newPart = new SparePart({
      name,
      description,
      price,
      carModel,
      createdBy: userId
    });

    await newPart.save();
    return res.status(201).json(newPart);
  } catch (error) {
    console.error('Error creating spare part:', error);
    return res.status(500).json({ message: 'An error occurred while creating the spare part' });
  }
};


const getUserSpareParts = async (req, res) => {
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

    const parts = await SparePart.find({ createdBy: userId }).sort({ createdAt: -1 });
    return res.status(200).json(parts);
  } catch (error) {
    console.error('Error fetching spare parts:', error);
    return res.status(500).json({ message: 'An error occurred while fetching spare parts' });
  }
};

const deleteSparePart = async (req, res) => {
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

    const part = await SparePart.findById(id);

    if (part === null) {
      return res.status(404).json({ message: 'Spare part not found' });
    }

    // check ownership
    let isOwner = false;
    if (part.createdBy !== undefined) {
      if (part.createdBy !== null) {
        if (String(part.createdBy) === String(userId)) {
          isOwner = true;
        }
      }
    }

    let isAdmin = false;
    if (req.user.role !== undefined) {
      if (req.user.role !== null) {
        if (req.user.role === 'admin') {
          isAdmin = true;
        }
      }
    }

    if (isOwner === false) {
      if (isAdmin === false) {
        return res.status(403).json({ message: 'Not authorized to delete this spare part' });
      }
    }

    await part.deleteOne();
    return res.status(200).json({ message: 'Spare part deleted successfully' });
  } catch (error) {
    console.error('Error deleting spare part:', error);
    return res.status(500).json({ message: 'An error occurred while deleting the spare part' });
  }
};

module.exports = {
  createSparePart,
  getUserSpareParts,
  deleteSparePart
};
