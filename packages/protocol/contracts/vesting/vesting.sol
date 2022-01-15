// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/utils/Address.sol';
import '@openzeppelin/contracts/utils/Context.sol';
import '@openzeppelin/contracts/utils/math/Math.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';

/**
 * @title VestingWallet
 * @dev This contract handles the vesting of Eth and ERC20 tokens for a given beneficiary. Custody of multiple tokens
 * can be given to this contract, which will release the token to the beneficiary following a given vesting schedule.
 * The vesting schedule is customizable through the {vestedAmount} function.
 *
 * Any token transferred to this contract will follow the vesting schedule as if they were locked from the beginning.
 * Consequently, if the vesting has already started, any amount of tokens sent to this contract will (at least partly)
 * be immediately releasable.
 */
contract VestingWallet is Context {
    event EtherReleased(uint256 amount);
    event ERC20Released(uint256 amount);

    struct Vest {
        uint64 startTimestamp;
        uint64 durationSeconds;
        uint64 cliffSeconds;
        uint64 periodSeconds;
        uint64 lastRelease;
        uint256 released;
    }

    mapping(address => Vest) vesting;
    address private _token;

    /**
     * @dev Set the beneficiary, start timestamp and vesting duration of the vesting wallet.
     */
    constructor(address tokenAddress) {
        require(tokenAddress != address(0), 'VestingWallet: Token address is zero address');
        _token = tokenAddress;
    }

    function vest(
        address _beneficiaryAddress,
        uint64 _startTimestamp,
        uint64 _durationSeconds,
        uint64 _cliffSeconds,
        uint64 _periodSeconds
    ) public {
        require(_beneficiaryAddress != address(0), 'VestingWallet: beneficiary is zero address');
        Vest storage vest_ = vesting[_beneficiaryAddress];
        vest_.startTimestamp = _startTimestamp;
        vest_.durationSeconds = _durationSeconds;
        vest_.cliffSeconds = _cliffSeconds;
        vest_.periodSeconds = _periodSeconds;
        vest_.lastRelease = 0;
        vest_.released = 0;
    }

    /**
     * @dev The contract should be able to receive Eth.
     */
    receive() external payable virtual {}

    // /**
    //  * @dev Getter for the beneficiary address.
    //  */
    // function beneficiary() public view virtual returns (address) {
    //     return _beneficiary;
    // }

    /**
     * @dev Getter for the start timestamp.
     */
    function start() public view virtual returns (uint256) {
        return _start;
    }

    /**
     * @dev Getter for the vesting duration.
     */
    function duration() public view virtual returns (uint256) {
        return _duration;
    }

    //TODO: Cliff, Period, Last Release

    /**
     * @dev Amount of token already released
     */
    function released(address _beneficiaryAddress) public view virtual returns (uint256) {
        return vesting[_beneficiaryAddress].released;
    }

    /**
     * @dev Release the tokens that have already vested.
     *
     * Emits a {TokensReleased} event.
     */
    function release(address _beneficiaryAddress) public virtual {
        require(
            now() >= vesting[_beneficiaryAddress].lastRelease + vesting[_beneficiaryAddress].periodSeconds,
            'EQUITY DAO: Next vesting period not reached'
        );
        uint256 releasable = vestedAmount(_beneficiaryAddress, uint64(block.timestamp)) - released(_beneficiaryAddress);
        require(releasable > 0, 'EQUITY DAO: No vested token available');
        vesting[_beneficiaryAddress].released = vesting[_beneficiaryAddress].released + releasable;
        vesting[_beneficiaryAddress].lastRelease = now();
        emit ERC20Released(releasable);
        SafeERC20.safeTransfer(IERC20(_token), _beneficiaryAddress, releasable);
    }

    /**
     * @dev Calculates the amount of tokens that has already vested. Default implementation is a linear vesting curve.
     */
    function vestedAmount(address _beneficiaryAddress, uint64 timestamp) public view virtual returns (uint256) {
        return _vestingSchedule(IERC20(_token).balanceOf(address(this)) + released(_beneficiaryAddress), timestamp);
    }

    /**
     * @dev Virtual implementation of the vesting formula. This returns the amout vested, as a function of time, for
     * an asset given its total historical allocation.
     */
    function _vestingSchedule(uint256 totalAllocation, uint64 timestamp) internal view virtual returns (uint256) {
        if (timestamp < start()) {
            return 0;
        } else if (timestamp > (start() + duration())) {
            return totalAllocation;
        } else {
            return (totalAllocation * (timestamp - start())) / duration();
        }
    }
}
